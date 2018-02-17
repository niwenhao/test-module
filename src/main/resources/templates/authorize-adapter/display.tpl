yieldUnescaped '<!DOCTYPE html>'

html(lang: 'ja') {
    head {
        meta("", charset: 'UTF-8')
        title("Login")
    }
    body {
        h1("テスト用ログイン画面")
        div {
            div(error["message"], id: "error_message")
            form(acton: "login", method="post") {
                input("", type: "hidden", name: "action", value: "login")
                input("", type: "hidden", name: "sessionID", value: sessionId)
                input("", type: "hidden", name: "sessionData", value: sessionData)
                div {
                    label("クライアント", class: "input_label")
                    input("", class: "input_field,readonly", type: "text", readonly: true, value: "${client.clientName}(${client.clientKey})")
                }
                div {
                    label("ユーザID", class: "input_label")
                    input("", class: "input_field", type: "text", name: "user_id", value: "")
                }
                div {
                    label("パスワード", class: "input_label")
                    input("", class: "input_field", type: "password", name: "password", value: "")
                }
                div(id: "operate_area") {
                    button("ログイン", type: "submit")
                }
            }
        }
    }
}