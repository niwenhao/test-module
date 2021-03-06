package jp.co.nri.openapi.testprovider.controller

import com.fasterxml.jackson.databind.ObjectMapper
import jp.co.nri.openapi.testprovider.model.AuthorizeTicket
import jp.co.nri.openapi.testprovider.model.Client
import jp.co.nri.openapi.testprovider.model.ClientDao
import jp.co.nri.openapi.testprovider.model.UserDao
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.hibernate.service.spi.InjectService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.stereotype.Controller
import org.springframework.ui.ModelMap
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.view.json.MappingJackson2JsonView
import java.net.URLEncoder
import java.security.MessageDigest
import java.util.*
import java.util.logging.Logger
import javax.annotation.Resource
import kotlin.collections.HashMap

@Controller
@RequestMapping("/authorize-adapter")
class AuthorizeAdapter(
        @Autowired
        val clientDao: ClientDao,
        @Autowired
        val userDao: UserDao
) {

    val log = Logger.getLogger(AuthorizeAdapter::class.java.name)

    @RequestMapping("/display")
    fun display(
            @RequestParam("sessionID")
            sessionId: String,
            @RequestParam("sessionData")
            sessionData: String,
            model: ModelMap) {
        val data = Base64.getUrlDecoder().decode(sessionData.replace(Regex("""^.*\.(.*)\..*$"""), "\$1"))
        data class RequestParameter( var client_id: String? = null)

        val mapper = ObjectMapper()
        val objSession = mapper.readValue(data, HashMap::class.java)

        this.log.info(mapper.writeValueAsString(objSession))

        objSession["request_parameters"]?.let { request ->
            (request as java.util.Map<String, String>)["client_id"]?.let { client_id ->
                clientDao.findByClientKey(client_id)?.let { client ->
                    model.put("sessionId", sessionId)
                    model.put("sessionData", sessionData)
                    model.put("client", client)
                    model.put("error", mapOf("message" to ""))
                }
            }
        }
    }

    @RequestMapping("/login")
    fun login(
            @RequestParam("sessionID")
            sessionId: String,
            @RequestParam("sessionData")
            sessionData: String,
            @RequestParam("user_id")
            userId: String,
            @RequestParam("password")
            password: String
    ):ModelAndView {
        val data = Base64.getUrlDecoder().decode(sessionData.replace(Regex("""^.*\.(.*)\..*$"""), "\$1"))
        data class RequestParameter( var client_id: String? = null)
        data class SessionData(var request_parameters: RequestParameter? = null )

        val mapper = ObjectMapper()
        val objSession = mapper.readValue(data, HashMap::class.java)

        val model = mutableMapOf<String, Any>()

        return objSession["request_parameters"]?.let { request ->
            (request as java.util.Map<String, String>)["client_id"]?.let { client_id ->
                clientDao.findByClientKey(client_id)?.let { client ->
                    userDao.login(client_id, userId, password)?.let { user ->
                        val md = MessageDigest.getInstance("MD5")
                        val ticket = AuthorizeTicket(client.clientKey,
                                user.userID?:"",
                                Base64.getEncoder().encodeToString(md.digest("${client.secret}${user.password}".toByteArray())))
                        val mapper = ObjectMapper()
                        val ticketJson = mapper.writeValueAsString(ticket)
                        ModelAndView(MappingJackson2JsonView(), mapOf("resource_owner" to user.userID,
                                "authticket" to URLEncoder.encode(ticketJson, "UTF-8")))
                    } ?: ModelAndView("display", mapOf(
                                "sessionId" to sessionId,
                                "sessionData" to sessionData,
                                "client" to client,
                                "error" to mapOf("message" to "ログインユーザIDとパスワードは識別できません。")
                        ))
                }
            }
        } ?: ModelAndView("error", mapOf("error" to "Failed"))
    }
}