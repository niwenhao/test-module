package jp.co.nri.openapi.testprovider.model

import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderApiHist
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import java.util.logging.Logger
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Component
interface ApiDao {
    fun getUserApiList(userId: Long): List<ProviderApi>
    fun getInvokedApiList(userId: String, path: String): List<ProviderApi>
    fun create(userId: Long, api: ProviderApi): ProviderApi?
    fun update(api: ProviderApi): ProviderApi?
    fun remove(apiId: Long): ProviderApi?
    fun findById(apiId: Long): ProviderApi?
}

@Repository
@Service
open class ApiDaoImpl(
        @PersistenceContext
        var em: EntityManager
): ApiDao {
    override fun getInvokedApiList(userId: String, path: String): List<ProviderApi> {
        val query = em.createQuery("select a from ProviderApi a where a.user.userID = :userId and a.apiPath = :path", ProviderApi::class.java)
        return query.setParameter("userId", userId).setParameter("path", path).resultList?.map { api ->
            em.detach(api)
            api.user = null
            api.providerApiHists = mutableListOf<ProviderApiHist>()
            api
        } ?: listOf()
    }

    companion object {
        val logger = Logger.getLogger(ApiDaoImpl::class.java.name)
    }
    override fun getUserApiList(userId: Long): List<ProviderApi> {
        val user = em.find(ProviderUser::class.java, userId)
        val apis = user.providerApis.map { api ->
            ProviderApi(api.id, null, api.apiPath, api.apiName, api.conditionJs, api.responseJson, mutableListOf())
        }
        //val query = em.createQuery("select a from ProviderApi a where a.providerUser.id = :id", ProviderApi::class.java)
        //val apis = query.setParameter("id", userId).resultList

        logger.info("apis.size = ${apis?.size}")

        return apis?: listOf()
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun create(userId: Long, api: ProviderApi): ProviderApi? {
        return em.find(ProviderUser::class.java, userId)?.let { user ->
            val napi = ProviderApi(null, user, api.apiPath, api.apiName, api.conditionJs, api.responseJson, mutableListOf())
            em.persist(napi)
            em.detach(napi)
            napi.user = null
            napi.providerApiHists = mutableListOf()
            napi
        }
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun update(api: ProviderApi): ProviderApi? {
        return em.find(ProviderApi::class.java, api.id)?.let { uapi ->
            uapi.apiPath = api.apiPath
            uapi.apiName = api.apiName
            uapi.conditionJs = api.conditionJs
            uapi.responseJson = api.responseJson

            em.persist(uapi)
            api
        }
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun remove(apiId: Long): ProviderApi? {
        return em.find(ProviderApi::class.java, apiId)?.let { api ->
            val r = ProviderApi(api.id, null, api.apiPath, api.apiName, api.conditionJs, api.responseJson, mutableListOf())
            em.remove(api)
            r.user = null
            r.providerApiHists = mutableListOf()
            r
        }
    }

    override fun findById(apiId: Long): ProviderApi? {
        return em.find(ProviderApi::class.java, apiId)?.let { api ->
            em.detach(api)
            api.user = null
            api.providerApiHists = mutableListOf()
            api
        }
    }
}