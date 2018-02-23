package jp.co.nri.openapi.testprovider.controller

import jp.co.nri.openapi.testprovider.Const
import jp.co.nri.openapi.testprovider.model.ClientDao
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import javax.annotation.Resource
import javax.servlet.http.HttpSession

@Controller
@RequestMapping("/test-data-manager")
class TestDataManager(
        @Resource
        var clientDao: ClientDao? = null
) {

    @RequestMapping("/index")
    fun index(
            session: HttpSession
    ) {
        session.attributeNames.toList().forEach { n ->
            session.removeAttribute(n)
        }
    }

    @RequestMapping("/admin")
    fun admin() {
    }

    @RequestMapping("/login")
    fun login(
            @RequestParam("client_key")
            clientKey: String,
            @RequestParam("secret")
            secret: String,
            session: HttpSession
    ): String {
        val client = clientDao?.findByClientKey(clientKey)
        return client?.let { c ->
            if (c.secret == secret) {
                session.setAttribute(Const.SK_CLIENT, c)
                "admin"
            } else
                "index"
        } ?: "index"

    }
}