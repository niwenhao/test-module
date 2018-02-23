yieldUnescaped '<!DOCTYPE html>'

html(lang: 'ja'){
    head {
        meta("", charset: 'UTF-8')
        title("Test manager")
        link("", rel: "stylesheet", type: "text/css", href: "/test-data-manager/cont/styles.css")
        script("", src: "/test-data-manager/cont/admin.js", type: "application/javascript")
    }
    body {
        div("loading .......................................", id: "root")
    }
}
