package jp.co.nri.openapi.testprovider.controller

import jp.co.nri.openapi.testprovider.Const
import jp.co.nri.openapi.testprovider.model.ApiDao
import jp.co.nri.openapi.testprovider.model.Client
import jp.co.nri.openapi.testprovider.model.ClientDao
import jp.co.nri.openapi.testprovider.model.UserDao
import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.web.bind.annotation.*
import javax.annotation.Resource
import javax.servlet.http.HttpSession
import javax.websocket.server.PathParam

@RestController
class ClientApiController(
        @Resource
        val clientDao: ClientDao
) {
    @RequestMapping(path = arrayOf("/api/adminclient"), method = arrayOf(RequestMethod.GET))
    fun currentClient(session: HttpSession): Client? {
        return session.getAttribute(Const.SK_CLIENT)?.let { c -> c as Client }
    }
    @RequestMapping(path = arrayOf("/api/client/{clientKey}"), method = arrayOf(RequestMethod.GET))
    fun currentClient(
            @PathVariable
            clientKey: String,
            session: HttpSession
    ): Client? {
        return clientDao.findByClientKey(clientKey)?.let { c ->
            session.setAttribute(Const.SK_CLIENT, c)
            c
        }
    }
}

@RestController
class UserServiceController(
        @Resource
        val userDao: UserDao
) {
    @RequestMapping("/api/users", method = arrayOf(RequestMethod.GET))
    fun list(session: HttpSession): List<ProviderUser>? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            userDao.list(client.clientKey)
        }
    }

    @RequestMapping("/api/users", method = arrayOf(RequestMethod.POST))
    fun create(
            session: HttpSession,
            @RequestBody
            user: ProviderUser
    ): ProviderUser? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            val newuser = ProviderUser(null, client.clientKey, user.userID, user.userName, user.password)
            userDao.create(newuser)
            newuser
        }
    }


    @RequestMapping("/api/users/{id}", method = arrayOf(RequestMethod.PUT))
    fun update(
        session: HttpSession,
        @PathVariable
        id: Long,
        @RequestBody
        user: ProviderUser
    ): ProviderUser? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            val u = userDao.find(id)
            u?.let {
                u.userID = user.userID
                u.userName = user.userName
                u.password = user.password
                userDao.update(u)
            }
            u
        }
    }

    @RequestMapping("/api/users/{id}", method = arrayOf(RequestMethod.DELETE))
    fun remove(
            session: HttpSession,
            @PathVariable
            id: Long
    ): ProviderUser? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            userDao.remove(id)
        }
    }
}

@RestController
@RequestMapping("/api/users/{userId}")
class ApiServiceController(
        val apiDao: ApiDao
) {
    @RequestMapping("/apis", method = arrayOf(RequestMethod.GET))
    fun list(
            @PathVariable
            userId: Long
    ): List<ProviderApi> {
        return apiDao.getUserApiList(userId)
    }
}
