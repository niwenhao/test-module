package jp.co.nri.openapi.testprovider

import java.util.regex.Pattern
import kotlin.reflect.KProperty
import kotlin.reflect.KProperty1

class Const {
    companion object {
        const val SK_CLIENT = "CLIENT_OBJECT_SESSION_KEY"
        const val CK_API_MATCH_CASE = "api.invoke.cases"
        const val CK_API_MATCH_INDEX = "api.invoke.cases.index"
        const val CK_API_MATCH_PATH = "api.invoke.cases.path"
        const val CK_API_PATH_PATTERN_BASE = "api.invoke.path.pattern"
        const val CK_API_AUTHTICKET_EXTRACE_BASE = "api.invoke.auth-ticket.extract"
    }
}

class CommonFunc {
    companion object {
        fun checkLongerThen(s: String?, len: Int, msg: String) {
            s?.let { s ->
                if (s.length > len) {
                    throw IllegalStateException(msg)
                }
            }
        }
    }
}

interface CheckableEntity<T> {
    fun checkString(p: KProperty1<T, String?>) {
        val domain = p.annotations.find { a ->
            Domain::class.isInstance(a)
        } as Domain

        domain?.let { d ->
            p.get(this as T)?.let { v ->
                if (d.min > 0 && v.length < d.min) {
                    throw IllegalStateException("${d.name}は${d.min}文字以上入力してください。")
                }

                if (d.max > 0 && v.length > d.max) {
                    throw IllegalStateException("${d.name}は${d.max}文字以下入力してください。")
                }

                var flg = false
                d.permitPatterns.forEach { p ->
                    val ptn = Pattern.compile(p)
                    flg = flg || ptn.matcher(v).find()
                }
                if (d.permitPatterns.size > 0 && !flg) {
                    throw IllegalStateException("${d.name}は以下のいずれのパターンにマッチする必要。\n${d.permitPatterns.joinToString("\n")}")
                }

                d.prohibitPatterns.forEach { p ->
                    var ptn = Pattern.compile(p)
                    if (ptn.matcher(v).find()) {
                        throw IllegalStateException("${d.name}に対して、以下のパターンが禁止です。\n${p}")
                    }
                }
            }
        }
    }
}

@Target(AnnotationTarget.PROPERTY)
@Retention(AnnotationRetention.RUNTIME)
annotation class Domain(
        val name: String,
        val min: Int = -1,
        val max: Int = -1,
        val permitPatterns: Array<String> = arrayOf(),
        val prohibitPatterns: Array<String> = arrayOf()
)
