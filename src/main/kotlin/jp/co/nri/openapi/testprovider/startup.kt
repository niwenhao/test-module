package jp.co.nri.openapi.testprovider

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.web.servlet.ServletComponentScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.web.servlet.i18n.CookieLocaleResolver

//@EntityScan(basePackages = arrayOf("jp.co.nri.openapi.testprovider.model.entity"))
//@ComponentScan(basePackages = arrayOf("jp.co.nri.openapi.testprovider.model"))
//@SpringBootApplication(scanBasePackages = arrayOf("jp.co.nri.openapi.testprovider.controller"))
@ServletComponentScan(basePackages = arrayOf("jp.co.nri.openapi.testprovider.controller"))
@SpringBootApplication
open class ProviderApplication {
}

fun main(argv: Array<String>) {
    SpringApplication.run(ProviderApplication::class.java, *argv)
}