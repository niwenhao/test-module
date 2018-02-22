yieldUnescaped '<!DOCTYPE html>'

html(lang: 'ja') {
    head {
        meta("", charset: 'UTF-8')
        title("Login")
        style("""
#login_pane {
  width: 700px;
  margin-left: auto;
  margin-right: auto;
}
#login_pane #error_message {
  color: red;
  font-weight: bolder;
}
#login_pane #input_line label {
  width: 200px;
  display: block;
}
#login_pane #input_line input {
  width: 600px;
}
#login_pane #operate_area {
  margin: auto;
  text-align: center;
}
#login_pane #operate_area button {
  width: 200px;
  height: 50px;
  margin: 10px;
}
""")
    }
    body {
        div(id: "login_pane") {
            h1("テスト用ログイン画面")
            hr("")
            div(error["message"], id: "error_message")
            form(acton: "login") {
                input("", type: "hidden", name: "action", value: "login")
                input("", type: "hidden", name: "sessionID", value: sessionId)
                input("", type: "hidden", name: "sessionData", value: sessionData)
                div(id: "input_line") {
                    label("クライアント", class: "input_label")
                    input("", class: "input_field,readonly", type: "text", readonly: true, value: "${client.clientName}(${client.clientKey})")
                }
                div(id: "input_line") {
                    label("ユーザID", class: "input_label")
                    input("", class: "input_field", type: "text", name: "user_id", value: "")
                }
                div(id: "input_line") {
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