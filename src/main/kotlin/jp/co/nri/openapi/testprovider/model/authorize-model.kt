package jp.co.nri.openapi.testprovider.model

data class AuthorizeTicket(
        var clientId: String? = null,
        var userId: String? = null,
        var hash: String? = null
)

data class Header(
        var name: String? = null,
        var value: String? = null
)

data class ApiResponse(
        var status: Int? = null,
        var headers: Array<Header>? = arrayOf(),
        var body: String? = null
)

data class ApiRequest(
        var method: String? = null,
        var headers: Array<Header>? = arrayOf(),
        var body: String? = null
)