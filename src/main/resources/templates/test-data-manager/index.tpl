yieldUnescaped '<!DOCTYPE html>'

html(lang: 'ja'){
    head {
        meta("", charset: 'UTF-8')
        title("Test manager")
    }
    body {
        h1("テストデータメンテナンス")
        div {
            div(error?.message ?: "", id: "error_message")
            form(action: "/test-data-manager/login", method: "post") {
                div {
                    label("クライアントキー", class: "input_label")
                    input("", class: "input_field", type: "text", name: "client_key", value: "")
                }
                div {
                    label("クライアントシークレット", class: "input_label")
                    input("", class: "input_field", type: "password", name: "secret", value: "")
                }
                div(id: "operate_area") {
                    button("ログイン", type: "submit")
                }
            }
        }
    }
}
