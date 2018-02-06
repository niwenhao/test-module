package jp.co.nri.openapi.testprovider.model

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
    fun login(clientKey: String, userId: String, password: String): ProviderUser?
}

@Service
@Repository
@Transactional(readOnly = true)
open class UserDaoImpl(
        @PersistenceContext
        var em: EntityManager) : UserDao {
    override fun login(clientKey: String, userId: String, password: String): ProviderUser? {
        val query = em.createQuery("select * from ProviderUser where clientKey = :clientKey and userID = :userId and password = :password",
                ProviderUser::class.java)
                .setParameter("clientKey", clientKey)
                .setParameter("userId", userId)
                .setParameter("password", password)
        val result = query.resultList
        return if (result.size > 0) result[0] else null
    }

    override fun list(clientKey: String): List<ProviderUser> {
        val query = em.createQuery("select c from ProviderUser c where clientKey = :clientKey", ProviderUser::class.java)
        return query.setParameter("clientKey", clientKey).resultList
    }

    override fun find(id: Long): ProviderUser? {
        return em.find(ProviderUser::class.java, id)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun create(user: ProviderUser) {
        val u = ProviderUser(null, user.clientKey, user.userID, user.userName, user.password, arrayListOf())
        em.persist(u)
    }

    @Transactional(readOnly = false, isolation = Isolation.READ_COMMITTED)
    override fun update(user: ProviderUser) {
        em.persist(em.merge(user))
    }
}