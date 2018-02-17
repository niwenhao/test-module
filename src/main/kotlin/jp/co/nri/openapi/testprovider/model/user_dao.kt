package jp.co.nri.openapi.testprovider.model

import jp.co.nri.openapi.testprovider.model.entity.ProviderApi
import jp.co.nri.openapi.testprovider.model.entity.ProviderUser
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Component
interface UserDao {
    fun list(clientKey: String): List<ProviderUser>
    fun find(id: Long): ProviderUser?
    fun create(user: ProviderUser)
    fun update(user: ProviderUser)
    fun remove(id: Long):ProviderUser?
    fun login(clientKey: String, userId: String, password: String): ProviderUser?
}

@Service
@Repository
@Transactional(readOnly = true)
open class UserDaoImpl(
        @PersistenceContext
        var em: EntityManager) : UserDao {
    override fun login(clientKey: String, userId: String, password: String): ProviderUser? {
        val query = em.createQuery("select u from ProviderUser u where clientKey = :clientKey and userID = :userId and password = :password",
                ProviderUser::class.java)
                .setParameter("clientKey", clientKey)
                .setParameter("userId", userId)
                .setParameter("password", password)
        val result = query.resultList
        return if (result.size > 0) result[0] else null
    }

    override fun list(clientKey: String): List<ProviderUser> {
        val query = em.createQuery("select c from ProviderUser c where clientKey = :clientKey", ProviderUser::class.java)
        return query.setParameter("clientKey", clientKey).resultList.map { u ->
            ProviderUser(u.id, u.clientKey, u.userID, u.userName, u.password, mutableListOf())
        }
    }

    override fun find(id: Long): ProviderUser? {
        return em.find(ProviderUser::class.java, id)?.let { user ->
            ProviderUser(user.id, user.clientKey, user.userID, user.userName, user.password, mutableListOf())
        }
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun create(user: ProviderUser) {
        val u = ProviderUser(null, user.clientKey, user.userID, user.userName, user.password, mutableListOf())
        em.persist(u)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun update(user: ProviderUser) {
        em.persist(em.merge(user))
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun remove(id: Long):ProviderUser? {
        return em.find(ProviderUser::class.java, id)?.let {  e ->
            val r = ProviderUser(e.id, e.clientKey, e.userID, e.userName, e.password, mutableListOf())
            em.remove(e)
            r
        }
    }
}