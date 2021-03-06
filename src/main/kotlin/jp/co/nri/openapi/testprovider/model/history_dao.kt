package jp.co.nri.openapi.testprovider.model

import com.fasterxml.jackson.databind.ObjectMapper
import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderApiHist
import jp.co.nri.openapi.testprovider.model.entity.ProviderApiHistRepository
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import java.util.logging.Level
import java.util.logging.Logger
import javax.annotation.Resource
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

data class RemoveHistoryResult(val result: Boolean, val message: String = "")

@Component
interface HistoryDao {
    fun listByApiId(apiId: Long):List<ProviderApiHist>
    fun findById(histId: Long): ProviderApiHist
    fun removeById(id: Long): RemoveHistoryResult
    fun removeByApiId(id: Long): RemoveHistoryResult
    fun removeByUserId(id: Long): RemoveHistoryResult
    fun removeByClientKey(clientKey: String): RemoveHistoryResult
    fun addHistory(apiId:Long, req: ApiRequest, res: ApiResponse, log: String)
}

@Repository
@Service
open class HistoryDaoImpl(
        @PersistenceContext
        val em: EntityManager,
        @Resource
        val repo: ProviderApiHistRepository
): HistoryDao {
    val log = Logger.getLogger(HistoryDaoImpl::class.java.name)

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun addHistory(apiId: Long, req: ApiRequest, res: ApiResponse, log: String) {
        val mapping = ObjectMapper()
        val api = em.find(ProviderApi::class.java, apiId)
        val hist = ProviderApiHist(null, api, System.currentTimeMillis(), res.status, mapping.writeValueAsString(req), mapping.writeValueAsString(res), log)
        em.persist(hist)
    }

    override fun findById(histId: Long): ProviderApiHist {
        return em.find(ProviderApiHist::class.java, histId).let { h ->
            log.log(Level.FINE, h.requestJson)
            log.log(Level.FINE, h.responseJson)
            log.log(Level.FINE, h.jslog)
            em.detach(h)
            h.api = null
            h
        }
    }

    override fun listByApiId(apiId: Long): List<ProviderApiHist> {
        val query = em.createQuery("select h from ProviderApiHist h where h.api.id = :id order by h.accessTime desc", ProviderApiHist::class.java)
        return query.setParameter("id", apiId).resultList?.map(){ hist ->
            var histSize = 0
            em.detach(hist)
            hist.api = null
            hist.requestJson = null
            hist.responseJson = null
            hist.jslog = null
            hist
        } ?: mutableListOf<ProviderApiHist>()
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByApiId(id: Long): RemoveHistoryResult {
        repo.deleteInBatch(repo.findHistByApiId(id))
        return RemoveHistoryResult(true)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByClientKey(clientKey: String): RemoveHistoryResult {
        repo.deleteInBatch(repo.findHistIdByClientKey(clientKey))
        return RemoveHistoryResult(true)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeById(id: Long): RemoveHistoryResult {
        repo.delete(id)
        return RemoveHistoryResult(true)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByUserId(id: Long): RemoveHistoryResult {
        repo.deleteInBatch(repo.findHistByUserId(id))
        return RemoveHistoryResult(true)
    }
}