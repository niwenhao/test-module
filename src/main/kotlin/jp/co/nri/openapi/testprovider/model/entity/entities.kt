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
        @OneToMany(targetEntity = ProviderApi::class)
        var providerApis: List<ProviderApi>? = null
)

@Entity
@Table(name="nri_test_api")
data class ProviderApi(
        @Id
        @GeneratedValue
        var id: Long,
        @ManyToOne()
        var providerUser: ProviderUser,
        @Column(length=128)
        var apiPath: String,
        @Column(length=128)
        var apiName: String,
        @Column(length=512*1024, columnDefinition = "LONG")
        var conditionJson: String,
        @Column(length=512*1024, columnDefinition = "LONG")
        var responseJson: String,
        @OneToMany(targetEntity = ProviderApiHist::class)
        var providerApiHists: List<ProviderApiHist>
)

@Entity
@Table(name="nri_test_hist")
data class ProviderApiHist(
        @Id
        @GeneratedValue
        var id: Long,
        @ManyToOne()
        var providerApi: ProviderApi,
        @Column
        var accessTime: Long,
        @Column(length=512*1024, columnDefinition = "LONG")
        var requestJson: String,
        @Column(length=512*1024, columnDefinition = "LONG")
        var responseJson: String
)
