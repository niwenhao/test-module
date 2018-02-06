package jp.co.nri.openapi.testprovider.model

import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import javax.persistence.Entity
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

data class Client(
        val clientKey: String,
        val secret: String,
        val callback: String,
        val clientName: String,
        val custom: String
)

@Component
interface ClientDao {
    fun findByClientKey(clientKey: String): Client?
}

@Repository
@Service
open class ClientDaoImpl(
        @PersistenceContext
        val em: EntityManager
): ClientDao {

    override fun findByClientKey(clientKey: String): Client? {
        val query = em.createNativeQuery("select client_key, secret, callback, client_name, custom from oauth_client_key where client_key = '${clientKey}'")
        val result = query.resultList as List<Array<Any>>
        return if (result.size > 0) {
            Client(result[0][0] as String, result[0][1] as String, result[0][2] as String, result[0][3] as String, result[0][4] as String)
        } else {
            null
        }
    }
}
