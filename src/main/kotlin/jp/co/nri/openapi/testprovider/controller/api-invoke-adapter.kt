package jp.co.nri.openapi.testprovider.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.deploy.net.HttpResponse
import jp.co.nri.openapi.testprovider.model.*
import org.springframework.http.HttpRequest
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import java.io.ByteArrayInputStream
import java.net.URLDecoder
import java.util.*
import javax.annotation.Resource
import javax.script.ScriptEngine
import javax.script.ScriptEngineManager
import javax.script.SimpleBindings
import javax.servlet.*
import javax.servlet.annotation.WebFilter
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletRequestWrapper
import javax.servlet.http.HttpServletResponse

class CustomServletInputStream: ServletInputStream {
    private var byteStream: ByteArrayInputStream

    constructor(body: ByteArray) {
        this.byteStream = ByteArrayInputStream(body)
    }

    override fun isReady(): Boolean {
        return true
    }

    override fun isFinished(): Boolean {
        return true
    }

    override fun read(): Int {
        return this.byteStream.read()
    }

    override fun setReadListener(listener: ReadListener?) {
        this.setReadListener(listener)
    }

    override fun read(b: ByteArray?): Int {
        return this.byteStream.read(b)
    }

    override fun read(b: ByteArray?, off: Int, len: Int): Int {
        return this.byteStream.read(b, off, len)
    }

    override fun skip(n: Long): Long {
        return this.byteStream.skip(n)
    }

    override fun available(): Int {
        return this.byteStream.available()
    }

    override fun reset() {
        this.byteStream.reset()
    }

    override fun close() {
        this.byteStream.close()
    }

    override fun mark(readlimit: Int) {
        this.byteStream.mark(readlimit)
    }

    override fun markSupported(): Boolean {
        return this.byteStream.markSupported()
    }
}

class CustomHttpServletRequest(req: HttpServletRequest, body: ByteArray): HttpServletRequestWrapper(req) {
    val customReqIS = CustomServletInputStream(body)

    override fun getInputStream(): ServletInputStream {
        return customReqIS
    }
}

@WebFilter(urlPatterns = arrayOf("/*"))
class ApiInvokeAdapter(
        @Resource
        val propertyDao: PropertyDao,
        @Resource
        val apiDao: ApiDao,
        @Resource
        val histDao: HistoryDao,
        val jsEngine:ScriptEngine = ScriptEngineManager().getEngineByName("nashorn")
): Filter {
    companion object {
        var config: Map<String, String> = mapOf()
    }

    override fun destroy() {
    }

    override fun init(filterConfig: FilterConfig?) {
        config = propertyDao.properties()
    }

    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {
        request?.let { request ->
            val req = request as HttpServletRequest
            response?.let { response ->
                var processed = false
                val res = response as HttpServletResponse

                var pathKey: String? = req.requestURI.replace("/", ".")
                var extractAuthTicketJS: String? = null
                while(pathKey != null)
                    pathKey = config["authorize.extract${pathKey}.javascript"] ?.let { js ->
                        extractAuthTicketJS = js
                        null
                    } ?: if (pathKey.length > 0) pathKey.replaceAfterLast('.', "") else null
                assert(extractAuthTicketJS != null)

                val header = mutableMapOf<String, String>()
                for (hn in req.headerNames.iterator()) {
                    req.getHeaders(hn)?.toList()?.first()?.let { v ->
                        header[hn] = v
                    }
                }
                val query = req.queryString
                val bodyByteArray = ByteArray(req.contentLength)
                var len = req.contentLength

                while(len > 0)
                    len = len - req.inputStream.read(bodyByteArray, req.contentLength - len, len)

                val body = String(bodyByteArray, Charsets.UTF_8)

                val binding = SimpleBindings(mapOf("path" to req.requestURI, "query" to query, "body" to body, "header" to header))
                val authTicket = jsEngine.eval(extractAuthTicketJS, binding) as String

                val mapping = ObjectMapper()
                val authData = mapping.readValue(URLDecoder.decode(authTicket, "UTF-8"), AuthorizeTicket::class.java)

                val apiList = apiDao.getInvokedApiList(authData.userId?:"", req.requestURI)

                apiList.forEach { api ->
                    val binding = SimpleBindings(mapOf("path" to req.requestURI, "query" to query, "body" to body, "header" to header))
                    if (!processed && jsEngine.eval(api.conditionJs, binding) as Boolean) {
                        processed = true
                        val responseData = mapping.readValue(api.responseJson, ApiResponse::class.java)
                        res.status = responseData.status?:200
                        responseData.headers?.forEach { h ->
                            res.addHeader(h.name, h.value)
                        }
                        res.writer.print(responseData.body)

                        val q = ApiRequest(req.method, null, body)
                        val qh = mutableListOf<Header>()

                        for(h in req.headerNames.iterator()) {
                            val values = req.getHeaders(h).iterator().forEach { v ->
                                qh += Header(h, v)
                            }
                        }

                        q.headers = qh.toTypedArray()

                        histDao.addHistory(api.id?:0, q, responseData)
                    }
                }
                if (!processed) {
                    chain?.doFilter(CustomHttpServletRequest(req, bodyByteArray), res)
                }
            }
        }
    }
}