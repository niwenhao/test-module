yieldUnescaped '<!DOCTYPE html>'

html(lang: 'ja'){
    head {
        meta("", charset: 'UTF-8')
        title("Test manager")
        script("", src: "/admin.js", type: "application/javascript")
    }
    body {
        div("loading .......................................", id: "root")
    }
}
