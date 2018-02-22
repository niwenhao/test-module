package jp.co.nri.openapi.testprovider.model

import jp.co.nri.openapi.testprovider.model.entity.ProviderConfig
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

data class ConfigEntity(
        var id: Long? = null,
        var name: String? = null,
        var value: String? = null
)

@Component
interface ConfigDao {
    fun properties(): Map<String, String>
    fun list(): List<ConfigEntity>
    fun create(pc: ConfigEntity): ConfigEntity?
    fun update(pc: ConfigEntity): ConfigEntity?
    fun remove(id: Long): ConfigEntity?
}

@Repository
@Service
open class ConfigDaoImpl(
        @PersistenceContext
        val em: EntityManager
): ConfigDao {
    override fun list(): List<ConfigEntity> {
        return em.createQuery("select c from ProviderConfig c order by c.name", ProviderConfig::class.java).resultList
                .map { c ->
                    ConfigEntity(c.id, c.name, c.value ?: c.largeValue)
                }
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun create(pc: ConfigEntity): ConfigEntity? {
        val c = ProviderConfig(null, pc.name)
        if (pc.value?.toByteArray()?.size?:0 > 512) {
            c.largeValue = pc.value
        } else {
            c.value = pc.value
        }

        em.persist(c)
        return pc
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun update(pc: ConfigEntity): ConfigEntity? {
        val c = em.find(ProviderConfig::class.java, pc.id)
        c.name = pc.name
        if (pc.value?.toByteArray()?.size?:0 > 512) {
            c.value = null
            c.largeValue = pc.value
        } else {
            c.value = pc.value
            c.largeValue = null
        }

        em.persist(c)
        return pc
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun remove(id: Long): ConfigEntity? {
        val c = em.find(ProviderConfig::class.java, id)
        val r = ConfigEntity(id, c.name, c.value ?: c.largeValue)
        em.remove(c)
        return r
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