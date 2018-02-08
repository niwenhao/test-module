package jp.co.nri.openapi.testprovider.model

import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Component
interface ApiDao {
    fun getUserApiList(userId: Long): List<ProviderApi>
    fun create(userId: Long, api: ProviderApi): ProviderApi?
    fun update(api: ProviderApi): ProviderApi?
    fun remove(apiId: Long): ProviderApi?
}

@Repository
@Service
class ApiDaoImpl(
        @PersistenceContext
        var em: EntityManager
): ApiDao {
    override fun getUserApiList(userId: Long): List<ProviderApi> {
        val user = em.find(ProviderUser::class.java, userId)
        return user.providerApis?: listOf()
    }

    override fun create(userId: Long, api: ProviderApi): ProviderApi? {
        return em.find(ProviderUser::class.java, userId)?.let { user ->
            val api = ProviderApi(null, user, api.apiPath, api.apiName, api.conditionJson, api.responseJson, listOf())
            em.persist(api)
            api
        }
    }

    override fun update(api: ProviderApi): ProviderApi? {
        return em.find(ProviderApi::class.java, api.id)?.let { uapi ->
            uapi.apiPath = api.apiPath
            uapi.apiName = api.apiName
            uapi.conditionJson = api.conditionJson
            uapi.responseJson = api.responseJson

            em.persist(uapi)
            api
        }
    }

    override fun remove(apiId: Long): ProviderApi? {
        return em.find(ProviderApi::class.java, apiId)?.let { api ->
            val r = ProviderApi(api.id, null, api.apiPath, api.apiName, api.conditionJson, api.responseJson, listOf())
            em.remove(api)
            r
        }
    }
}