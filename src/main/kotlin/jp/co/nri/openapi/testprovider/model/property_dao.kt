package jp.co.nri.openapi.testprovider.model

import jp.co.nri.openapi.testprovider.model.entity.ProviderConfig
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Component
interface PropertyDao {
    fun getPropertyValue(name: String): String?
    fun setProperty(name: String, value: String)
    fun removeProperty(name: String)
    fun properties(): Map<String, String>
}

@Repository
@Service
open class PropertyDaoImpl(
        @PersistenceContext
        val em: EntityManager
): PropertyDao {
    override fun getPropertyValue(name: String): String? {
        val query = em.createQuery("select c from ProviderConfig c where c.name = :name", ProviderConfig::class.java)
        val resultList = query.setParameter("name", name).resultList
        assert(resultList.size == 1)

        val property = resultList.first()
        return property.value ?: property.largeValue
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun setProperty(name: String, value: String) {
        val query = em.createQuery("select c from ProviderConfig c where c.name = :name", ProviderConfig::class.java)
        val property = query.setParameter("name", name).resultList.firstOrNull() ?: ProviderConfig(null, name, null, null)

        if (value.toByteArray(Charsets.UTF_8).size < 512) {
            property.value = value
            property.largeValue = null
        } else {
            property.value = null
            property.largeValue = value
        }

        em.persist(property)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun removeProperty(name: String) {
        val query = em.createQuery("select c from ProviderConfig c where c.name = :name", ProviderConfig::class.java)
        query.setParameter("name", name).resultList.firstOrNull()?.let { p ->
            em.remove(p)
        }

    }

    override fun properties(): Map<String, String> {
        val map = mutableMapOf<String, String>()
        val resultList = em.createQuery("select c from ProviderConfig c", ProviderConfig::class.java).resultList

        for (ent in resultList) {
            map[ent.name?:""] = ent.value ?: ent.largeValue ?: ""
        }

        return map.toMap()
    }
}