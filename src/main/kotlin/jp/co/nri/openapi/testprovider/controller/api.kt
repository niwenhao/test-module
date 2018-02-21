package jp.co.nri.openapi.testprovider.controller

import jp.co.nri.openapi.testprovider.Const
import jp.co.nri.openapi.testprovider.model.*
import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderApiHist
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.web.bind.annotation.*
import javax.annotation.Resource
import javax.servlet.http.HttpSession

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

    @RequestMapping("/api/users/{id}", method = arrayOf(RequestMethod.GET))
    fun userById(
            session: HttpSession,
            @PathVariable
            id: Long
    ): ProviderUser? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            userDao.find(id)
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
            userId: Long,
            session: HttpSession
    ): List<ProviderApi> {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            apiDao.getUserApiList(userId)
        } ?: listOf()
    }

    @RequestMapping("/apis", method = arrayOf(RequestMethod.POST))
    fun create(
            @PathVariable
            userId: Long,
            @RequestBody
            api: ProviderApi,
            session: HttpSession
    ): ProviderApi? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            apiDao.create(userId, api)
        }
    }

    @RequestMapping("/apis/{apiId}", method = arrayOf(RequestMethod.GET))
    fun getById(
            session: HttpSession,
            @PathVariable
            apiId: Long
    ): ProviderApi? {
        return apiDao.findById(apiId)
    }

    @RequestMapping("/apis/{apiId}", method = arrayOf(RequestMethod.PUT))
    fun update(
            session: HttpSession,
            @PathVariable
            userId: Long,
            @PathVariable
            apiId: Long,
            @RequestBody
            api: ProviderApi
    ): ProviderApi? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            api.id = apiId
            apiDao.update(api)
        }
    }
    @RequestMapping("/apis/{id}", method = arrayOf(RequestMethod.DELETE))
    fun remove(
            session: HttpSession,
            @PathVariable
            id: Long
    ): ProviderApi? {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { client ->
            apiDao.remove(id)
        }
    }
}

//@RequestMapping("/api/users/{userId}/apis/{apiId}")
@RestController
@RequestMapping("/api/hist")
class HistoryServiceController(
        @Resource
        val histDao: HistoryDao
) {

    @RequestMapping("/api/{apiId}", method = arrayOf(RequestMethod.GET))
    fun listByApiId(
            session: HttpSession,
            @PathVariable
            apiId:Long
    ): List<ProviderApiHist> {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let {
            histDao.listByApiId(apiId)
        } ?: listOf<ProviderApiHist>()
    }

    @RequestMapping("/client", method = arrayOf(RequestMethod.DELETE))
    fun removeByClientId(
            session: HttpSession
    ): RemoveHistoryResult {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let { c ->
            histDao.removeByClientKey(c.clientKey)
        }?: RemoveHistoryResult(false)
    }

    @RequestMapping("/user/{userId}", method = arrayOf(RequestMethod.DELETE))
    fun removeByUserId(
            session: HttpSession,
            @PathVariable
            userId: Long
    ): RemoveHistoryResult {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let {
            histDao.removeByUserId(userId)
        }?: RemoveHistoryResult(false)
    }

    @RequestMapping("/api/{apiId}", method = arrayOf(RequestMethod.DELETE))
    fun removeByApiId(
            session: HttpSession,
            @PathVariable
            apiId: Long
    ): RemoveHistoryResult {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let {
            histDao.removeByApiId(apiId)
        }?: RemoveHistoryResult(false)
    }

    @RequestMapping(path = arrayOf("/api/{apiId}/{histId}"), method = arrayOf(RequestMethod.DELETE))
    fun removeById(
            session: HttpSession,
            @PathVariable
            histId: Long
    ): RemoveHistoryResult {
        return (session.getAttribute(Const.SK_CLIENT) as Client?)?.let {
            histDao.removeById(histId)
        }?: RemoveHistoryResult(false, "Failed to remove history")
    }
}

@RestController
class ConfigServiceController(
        @Resource
        val configDao: ConfigDao
) {
    @RequestMapping("/api/configurations", method = arrayOf(RequestMethod.GET))
    fun list(
            session: HttpSession
    ): List<ConfigEntity> {
        ApiInvokeAdapter.config = configDao.properties()
        return session.getAttribute(Const.SK_CLIENT)?.let {
            configDao.list()
        }?: listOf()
    }

    @RequestMapping("/api/configurations", method = arrayOf(RequestMethod.POST))
    fun create(
            session: HttpSession,
            @RequestBody
            pc: ConfigEntity
    ): ConfigEntity? {
        return session.getAttribute(Const.SK_CLIENT)?.let {
            return configDao.create(pc)
        }
    }

    @RequestMapping("/api/configurations/{configId}", method = arrayOf(RequestMethod.PUT))
    fun update(
            session: HttpSession,
            @PathVariable
            configId: Long,
            @RequestBody
            pc: ConfigEntity
    ): ConfigEntity? {
        return session.getAttribute(Const.SK_CLIENT)?.let {
            return configDao.update(pc)
        }
    }

    @RequestMapping("/api/configurations/{configId}", method = arrayOf(RequestMethod.DELETE))
    fun delete(
            session: HttpSession,
            @PathVariable
            configId: Long
    ): ConfigEntity? {
        return configDao.remove(configId)
    }
}
