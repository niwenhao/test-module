package jp.co.nri.openapi.testprovider.controller

import com.fasterxml.jackson.databind.ObjectMapper
import jp.co.nri.openapi.testprovider.model.Client
import jp.co.nri.openapi.testprovider.model.ClientDao
import jp.co.nri.openapi.testprovider.model.UserDao
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.hibernate.service.spi.InjectService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Controller
import org.springframework.ui.ModelMap
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.view.json.MappingJackson2JsonView
import java.util.*
import javax.annotation.Resource

@Controller
@RequestMapping("/authorize-adapter")
class AuthorizeAdapter(
        @Autowired
        val clientDao: ClientDao,
        @Autowired
        val userDao: UserDao
) {

    @RequestMapping("/display")
    fun display(
            @RequestParam("sessionID")
            sessionId: String,
            @RequestParam("sessionData")
            sessionData: String,
            model: ModelMap): String {
        val data = Base64.getUrlDecoder().decode(sessionData)
        data class RequestParameter( var client_id: String? = null)
        data class SessionData(var request_parameter: RequestParameter? = null )

        val objSession = ObjectMapper().readValue(data, SessionData::class.java)

        return (objSession.request_parameter?.let { request ->
            request.client_id?.let { client_id ->
                clientDao.findByClientKey(client_id)?.let { client ->
                    model.put("sessionId", sessionId)
                    model.put("sessionData", sessionData)
                    model.put("client", client)
                    model.put("error", mapOf("message" to ""))
                    "display"
                }
            }
        }) ?: "/error"
    }

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
        val data = Base64.getUrlDecoder().decode(sessionData)
        data class RequestParameter( var client_id: String? = null)
        data class SessionData(var request_parameter: RequestParameter? = null )

        val objSession = ObjectMapper().readValue(data, SessionData::class.java)

        val model = mutableMapOf<String, Any>()

        return (objSession.request_parameter?.let { request ->
            request.client_id?.let { client_id ->
                clientDao.findByClientKey(client_id)?.let { client ->
                    userDao.login(client_id, userId, password)?.let { user ->
                        ModelAndView(MappingJackson2JsonView(), mapOf("resource_owner" to user.userID, "" to Base64.getEncoder().encodeToString(user.userID.toByteArray())))
                    } ?: {
                        ModelAndView("display", mapOf(
                                "sessionId" to sessionId,
                                "sessionData" to sessionData,
                                "client" to client,
                                "error" to mapOf("message" to "ログインユーザIDとパスワードは識別できません。")
                        ))
                    }()

                }
            }
        }) ?: ModelAndView("error", mapOf("error" to "Failed"))
    }
}