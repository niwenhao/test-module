package jp.co.nri.openapi.testprovider.model.entity

import javax.persistence.*

@Entity
@Table(name="nri_test_user")
data class ProviderUser(
        @Id
        @GeneratedValue
        var id: Long? = null,
        @Column(length=64)
        var clientKey: String? = null,
        @Column(length=20)
        var userID: String? = null,
        @Column(length=64)
        var userName: String? = null,
        @Column(length=64)
        var password: String? = null,
        @OneToMany(targetEntity = ProviderApi::class, cascade = arrayOf(CascadeType.ALL), mappedBy = "user", fetch = FetchType.LAZY)
        var providerApis: MutableList<ProviderApi> = mutableListOf()
)

@Entity
@Table(name="nri_test_api")
data class ProviderApi(
        @Id
        @GeneratedValue
        var id: Long? = null,
        @ManyToOne()
        var user: ProviderUser? = null,
        @Column(length=128)
        var apiPath: String? = null,
        @Column(length=128)
        var apiName: String? = null,
        @Column(length=512*1024, columnDefinition = "LONG")
        var conditionJson: String? = null,
        @Column(length=512*1024, columnDefinition = "LONG")
        var responseJson: String? = null,
        @OneToMany(targetEntity = ProviderApiHist::class, cascade = arrayOf(CascadeType.ALL), mappedBy = "api", fetch = FetchType.LAZY)
        var providerApiHists: MutableList<ProviderApiHist> = mutableListOf()
)

@Entity
@Table(name="nri_test_hist")
data class ProviderApiHist(
        @Id
        @GeneratedValue
        var id: Long?,
        @ManyToOne
        var api: ProviderApi?,
        @Column
        var accessTime: Long?,
        @Column(length=512*1024, columnDefinition = "LONG")
        var requestJson: String?,
        @Column(length=512*1024, columnDefinition = "LONG")
        var responseJson: String?
)
