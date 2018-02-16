import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { UserMgr } from './usermgr'
import { ApiMgr } from './apimgr'
import { HistMgr } from './histmgr'
import { ConfigMgr } from './confmgr'
import { BrowserRouter, Route, Link, Switch, RouteComponentProps } from "react-router-dom"

function MenuPane(props: RouteComponentProps<any>) {
  const doConfig = () => {
    props.history.push("./config")
  }

  const doUserApi = () => {
    props.history.push("./users")
  }
  return (
    <div>
      <div><button onClick={() => doConfig()}>設定管理</button></div>
      <div><button onClick={() => doUserApi()}>ユーザ・API管理</button></div>
    </div>
  )
}

function MainPane(props: any) {
  return (
      <BrowserRouter>
          <Switch>
            <Route exact path="/test-data-manager/login" component={MenuPane}/>
            <Route exact path="/test-data-manager/config" component={ConfigMgr}/>
            <Route exact path="/test-data-manager/users" component={UserMgr}/>
            <Route exact path="/test-data-manager/users/:uid/apis" component={ApiMgr}/>
            <Route exact path="/test-data-manager/users/:uid/apis/:aid/history" component={HistMgr}/>
          </Switch>
      </BrowserRouter>
  )
}

window.onload = function() {
  ReactDOM.render(
  <MainPane/>,
  document.getElementById("root")
  )
}