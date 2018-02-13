package jp.co.nri.openapi.testprovider.model

import com.fasterxml.jackson.databind.ObjectMapper
import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderApiHist
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import javax.annotation.Resource
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

data class RemoveHistoryResult(val result: Boolean)

@Component
interface HistoryDao {
    fun listByApiId(apiId: Long):List<ProviderApiHist>
    fun removeById(id: Long): RemoveHistoryResult
    fun removeByApiId(id: Long): RemoveHistoryResult
    fun removeByUserId(id: Long): RemoveHistoryResult
    fun removeByClientKey(clientKey: String): RemoveHistoryResult
    fun addHistory(apiId:Long, req: ApiRequest, res: ApiResponse)
}

@Repository
@Service
open class HistoryDaoImpl(
        @PersistenceContext
        val em: EntityManager
): HistoryDao {
    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun addHistory(apiId: Long, req: ApiRequest, res: ApiResponse) {
        val mapping = ObjectMapper()
        val api = em.find(ProviderApi::class.java, apiId)
        val hist = ProviderApiHist(null, api, System.currentTimeMillis(), mapping.writeValueAsString(req), mapping.writeValueAsString(res))
        em.persist(hist)
    }

    override fun listByApiId(apiId: Long): List<ProviderApiHist> {
        val query = em.createQuery("select h from ProviderApiHist h where h.api.id = :id", ProviderApiHist::class.java)
        return query.setParameter("id", apiId).resultList?.map(){ hist ->
            em.detach(hist)
            hist.api = null
            hist
        } ?: mutableListOf<ProviderApiHist>()
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByApiId(id: Long): RemoveHistoryResult {
        return if (em.createQuery("delete from ProviderApiHist h where h.api.id = :id")
                .setParameter("id", id)
                .executeUpdate() > 0)
            RemoveHistoryResult(true)
        else
            RemoveHistoryResult(false)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByClientKey(clientKey: String): RemoveHistoryResult {
        return if (em.createQuery("delete from ProviderApiHist h where h.api.user.clientKey = :key")
                .setParameter("key", clientKey)
                .executeUpdate() > 0)
            RemoveHistoryResult(true)
        else
            RemoveHistoryResult(false)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeById(id: Long): RemoveHistoryResult {
        return if (em.createQuery("delete from ProviderApiHist h where h.id = :id")
                .setParameter("id", id)
                .executeUpdate() > 0)
            RemoveHistoryResult(true)
        else
            RemoveHistoryResult(false)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeByUserId(id: Long): RemoveHistoryResult {
        return if (em.createQuery("delete from ProviderApiHist h where h.api.user.id = :id")
                .setParameter("id", id)
                .executeUpdate() > 0)
            RemoveHistoryResult(true)
        else
            RemoveHistoryResult(false)
    }
}