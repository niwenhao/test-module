package jp.co.nri.openapi.testprovider.model.entity

import jp.co.nri.openapi.testprovider.CheckableEntity
import jp.co.nri.openapi.testprovider.CommonFunc
import jp.co.nri.openapi.testprovider.Domain
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import javax.persistence.*

@Entity
@Table(name = "nri_test_config",
        indexes = arrayOf(Index(columnList = "name", unique = true)))
data class ProviderConfig (
        @Id
        @GeneratedValue
        var id: Long? = null,
        @Domain(name="キー", max = 128)
        @Column(length = 128)
        var name: String? = null,
        @Column(length = 512)
        var value: String? = null,
        @Lob
        @Basic(fetch = FetchType.LAZY)
        @Column
        var largeValue: String? = null
): CheckableEntity<ProviderConfig> {
    @PreUpdate
    @PrePersist
    fun validate() {
        checkString(ProviderConfig::name)
    }
}

@Entity
@Table(name = "nri_test_user",
        indexes = arrayOf(Index(columnList = "clientKey,userID", unique = true)))
data class ProviderUser(
        @Id
        @GeneratedValue
        var id: Long? = null,
        @Column(length = 64)
        var clientKey: String? = null,
        @Domain(name = "ユーザID", max = 20)
        @Column(length = 20)
        var userID: String? = null,
        @Domain(name = "ユーザ名", max = 64)
        @Column(length = 64)
        var userName: String? = null,
        @Domain(name = "パスワード", max = 64)
        @Column(length = 64)
        var password: String? = null,
        @OneToMany(targetEntity = ProviderApi::class, cascade = arrayOf(CascadeType.ALL), mappedBy = "user", fetch = FetchType.LAZY)
        var providerApis: MutableList<ProviderApi> = mutableListOf()
): CheckableEntity<ProviderUser> {
    @PrePersist
    @PreUpdate
    fun validate() {
        checkString(ProviderUser::userID)
        checkString(ProviderUser::userName)
        checkString(ProviderUser::password)
    }
}

@Entity
@Table(name = "nri_test_api")
data class ProviderApi(
        @Id
        @GeneratedValue
        var id: Long? = null,
        @ManyToOne()
        var user: ProviderUser? = null,
        @Domain(name = "APIパス", max = 128)
        @Column(length = 128)
        var apiPath: String? = null,
        @Domain(name = "API詳細", max = 128)
        @Column(length = 128)
        var apiName: String? = null,
        @Domain(name = "呼出条件", max = 512*1024, prohibitPatterns = arrayOf("java\\.", "eval\\("))
        @Column(length = 512 * 1024, columnDefinition = "LONG")
        var conditionJs: String? = null,
        @Lob
        @Basic(fetch = FetchType.LAZY)
        @Column
        var responseJson: String? = null,
        @OneToMany(targetEntity = ProviderApiHist::class, cascade = arrayOf(CascadeType.ALL), mappedBy = "api", fetch = FetchType.LAZY)
        var providerApiHists: MutableList<ProviderApiHist> = mutableListOf()
):CheckableEntity<ProviderApi> {
    @PrePersist
    @PreUpdate
    fun validate() {
//        val p = Regex("java\\.io|java\\.nio|java\\.lang|java\\.net|eval\\(")
//        if (p.find(conditionJs ?: "") != null) {
//            throw IllegalStateException("条件項目に危険なJavaScriptを設定しました。")
//        }
        checkString(ProviderApi::apiPath)
        checkString(ProviderApi::apiName)
        checkString(ProviderApi::conditionJs)
    }
}

@Entity
@Table(name = "nri_test_hist")
data class ProviderApiHist(
        @Id
        @GeneratedValue
        var id: Long? = null,
        @ManyToOne
        var api: ProviderApi? = null,
        @Column
        var accessTime: Long? = null,
        @Column
        var status: Int? = null,
        @Lob
        @Basic(fetch = FetchType.LAZY)
        @Column
        var requestJson: String? = null,
        @Lob
        @Basic(fetch = FetchType.LAZY)
        @Column
        var responseJson: String? = null,

        @Lob
        @Basic(fetch = FetchType.LAZY)
        @Column
        var jslog: String? = null
)

interface ProviderApiHistRepository : JpaRepository<ProviderApiHist, Long> {
    @Query("select h from ProviderApiHist h where h.api.id = :apiId")
    fun findHistByApiId(
            @Param("apiId")
            apiId: Long
    ): List<ProviderApiHist>

    @Query("select h from ProviderApiHist h where h.api.user.id = :userId")
    fun findHistByUserId(
            @Param("userId")
            userId: Long
    ): List<ProviderApiHist>

    @Query("select h from ProviderApiHist h where h.api.user.clientKey = :key")
    fun findHistIdByClientKey(
            @Param("key")
            clientKey: String
    ): List<ProviderApiHist>
}
