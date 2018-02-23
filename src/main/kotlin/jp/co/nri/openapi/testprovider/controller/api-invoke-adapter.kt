package jp.co.nri.openapi.testprovider.controller

import com.fasterxml.jackson.databind.ObjectMapper
import jp.co.nri.openapi.testprovider.Const
import jp.co.nri.openapi.testprovider.model.*
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.net.URLDecoder
import java.util.logging.Logger
import javax.annotation.Resource
import javax.script.ScriptEngine
import javax.script.ScriptEngineManager
import javax.script.SimpleBindings
import javax.servlet.*
import javax.servlet.annotation.WebFilter
import javax.servlet.annotation.WebServlet
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@WebServlet(urlPatterns = arrayOf("/api-dispatcher"))
class ApiDispatcher(
        @Resource
        var propertyDao: ConfigDao? = null,
        @Resource
        var apiDao: ApiDao? = null,
        @Resource
        var histDao: HistoryDao? = null,
        val jsEngine: ScriptEngine = ScriptEngineManager().getEngineByName("nashorn")
) : HttpServlet() {
    companion object {
        val log = Logger.getLogger(ApiDispatcher::class.java.name)
    }
    override fun service(req: HttpServletRequest?, res: HttpServletResponse?) {
        req?.let { req ->
            res?.let { res ->

                var processed = false
                val index = req.getAttribute(Const.CK_API_MATCH_INDEX)
                ApiInvokeAdapter.config["${Const.CK_API_AUTHTICKET_EXTRACE_BASE}.${index}"]?.let { js ->
                    val header = mutableMapOf<String, String>()
                    for (hn in req.headerNames.iterator()) {
                        req.getHeaders(hn)?.toList()?.first()?.let { v ->
                            header[hn] = v
                        }
                    }
                    val query = req.queryString
                    val bodyByteArray = ByteArray(req.contentLength)
                    var len = req.contentLength

                    while (len > 0)
                        len = len - req.inputStream.read(bodyByteArray, req.contentLength - len, len)

                    val body = String(bodyByteArray, Charsets.UTF_8)

                    val bufStream = ByteArrayOutputStream()
                    var bufWriter = PrintStream(bufStream, true, Charsets.UTF_8.name())
                    bufWriter.println("============================== BY SETUP ==============================")

                    val binding = SimpleBindings(mapOf("path" to req.requestURI, "query" to query, "body" to body, "header" to header, "log" to bufWriter))

                    val authTicket = jsEngine.eval(js, binding) as String

                    bufWriter.flush()
                    log.info(bufStream.toString(Charsets.UTF_8.name()))

                    val mapping = ObjectMapper()
                    val authData = mapping.readValue(URLDecoder.decode(authTicket, "UTF-8"), AuthorizeTicket::class.java)

                    val apiList = apiDao?.getInvokedApiList(authData.userId ?: "", req.getAttribute(Const.CK_API_MATCH_PATH) as String) ?: listOf()

                    apiList.forEach { api ->
                        val binding = SimpleBindings(mapOf("path" to req.requestURI, "query" to query, "body" to body, "header" to header, "log" to bufWriter))
                        if (!processed) { //&& (api.conditionJs == null || jsEngine.eval(api.conditionJs, binding) as Boolean)) {
                            api.conditionJs?.let { js ->
                                bufWriter.println("=============================== BY API ===============================")

                                if (jsEngine.eval(js, binding) as Boolean) {

                                    bufWriter.flush()
                                    log.info(bufStream.toString(Charsets.UTF_8.name()))

                                    processed = true

                                    val responseData = mapping.readValue(api.responseJson, ApiResponse::class.java)
                                    res.status = responseData.status ?: 200
                                    responseData.headers?.forEach { h ->
                                        res.setHeader(h.name, h.value)
                                    }
                                    res.contentType = "application/json; charset=UTF8"
                                    responseData.body?.let { body ->
                                        res.outputStream.write(body.toByteArray())
                                        res.outputStream.flush()
                                        //res.outputStream.close()
                                    }

                                    val q = ApiRequest(req.method, null, body)
                                    val qh = mutableListOf<Header>()

                                    for (h in req.headerNames.iterator()) {
                                        val values = req.getHeaders(h).iterator().forEach { v ->
                                            qh += Header(h, v)
                                        }
                                    }

                                    q.headers = qh.toTypedArray()

                                    histDao?.addHistory(api.id ?: 0, q, responseData, bufStream.toString(Charsets.UTF_8.name()))
                                }
                            }
                        }
                    }
                    if (!processed) {
                        processed = true
                        res.status = 400
                        res.contentType = "text/html"
                        res.writer.print("""<!DOCTYPE html>
                                                         <html>
                                                         <body>
                                                         Cann't found adopted API.
                                                         </body>
                                                         </html>
                                                         """)
                    }

                }
            }
        }
    }
}

@WebFilter(urlPatterns = arrayOf("/*"))
class ApiInvokeAdapter(
        @Resource
        var propertyDao: ConfigDao? = null,
        @Resource
        var apiDao: ApiDao? = null,
        @Resource
        var histDao: HistoryDao? = null,
        val jsEngine: ScriptEngine = ScriptEngineManager().getEngineByName("nashorn")
) : Filter {

    companion object {
        var config: Map<String, String> = mapOf()
    }

    var filterConfig: FilterConfig? = null

    override fun destroy() {
    }

    override fun init(filterConfig: FilterConfig?) {
        this.filterConfig = filterConfig

        config = propertyDao?.properties() ?: mapOf()
    }

    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {
        request?.let { request ->
            val req = request as HttpServletRequest
            response?.let { response ->
                val res = response as HttpServletResponse
                var processed = false

                config[Const.CK_API_MATCH_CASE]?.let { indexStr ->
                    indexStr.split(",").forEach { index ->
                        config["${Const.CK_API_PATH_PATTERN_BASE}.${index}"]?.let { ptn ->
                            val reg = Regex(ptn)
                            if (reg.matches(req.requestURI)) {

                                req.setAttribute(Const.CK_API_MATCH_INDEX, index)
                                req.setAttribute(Const.CK_API_MATCH_PATH, req.requestURI)

                                filterConfig?.servletContext?.getRequestDispatcher("/api-dispatcher")?.forward(request, response)
                                processed = true
                            }
                        }
                    }
                }
                if (!processed) {
                    chain?.doFilter(req, res)
                }
            }
        }
    }
}

