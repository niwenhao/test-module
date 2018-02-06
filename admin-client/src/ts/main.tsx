import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { UserMgr } from './usermgr'
import { ApiMgr } from './apimgr'
import { HistMgr } from './histmgr'
import { BrowserRouter, Route, Link, Switch } from "react-router-dom"

function MainPane(props: any) {
  return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/test-data-manager/login" component={UserMgr}/>
          <Route exact path="/test-data-manager/login/user/:uid/api" component={ApiMgr}/>
          <Route exact path="/test-data-manager/login/user/:uid/api/:aid/hist" component={HistMgr}/>
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