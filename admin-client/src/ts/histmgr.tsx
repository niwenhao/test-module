import * as React from "react"
import * as Backbone from 'backbone'

import { ClientModel ,UserModel, ApiModel, HistoryModel, HistoryCollection, RequestData, ResponseData } from './common/entities'
import { BrowserRouter, Route, Link, RouteComponentProps } from "react-router-dom"

interface HistMgrState {
  client: ClientModel | null
  user: UserModel | null
  api: ApiModel | null
  historyList: HistoryCollection | null
  currentHistory: HistoryModel | null
}
export class HistMgr extends React.Component<RouteComponentProps<any>, HistMgrState> {

  userId: string
  apiId: string

  constructor(props: RouteComponentProps<any>) {
    super(props)

    this.userId = props.match.params.uid
    this.apiId = props.match.params.aid
    this.state = {
      client: null,
      user: null,
      api: null,
      historyList: null,
      currentHistory: null
    }
  }
  
  componentDidMount() {
    let cl = new ClientModel()
    cl.fetch({
      success: () => this.setState({ client: cl })
    })

    let u = new UserModel()
    u.url = () => `/api/users/${this.userId}`
    u.fetch({
      success: () => this.setState({ user: u})
    })

    let a = new ApiModel()
    a.url = () => `/api/users/${this.userId}/apis/${this.apiId}`
    a.fetch({
      success: () => this.setState({api: a})
    })

    this.refresh()
   }

  refresh() {
   let hc = new HistoryCollection(this.apiId)
    hc.fetch({
      success: () => this.setState({historyList: hc, currentHistory: null})
    })
  }

  doDelete(hist: HistoryModel) {
    let h = this.state.historyList!.get(hist.id)
    let self = this
    h.destroy({ success: () => {
      this.setState({currentHistory: null})
      this.refresh()
    }})
  }

  toSelect(hist: HistoryModel) {
    this.setState({currentHistory: hist})
  }

  render(): React.ReactNode {
    let self = this

    type DetailProps = {
      history: HistoryModel, 
      onDelete: (h: HistoryModel) => void
    }

    if (this.state.client && this.state.user && this.state.api && this.state.historyList) {
      return (
        <div id="histmgr">
          <h1>呼出履歴メンテナンス</h1>
          <hr/>
          <div id="button_area">
            <button onClick={() => this.props.history.goBack()}>APIメンテへ</button>
            <button onClick={() => self.refresh()}>再取得</button>
            <button onClick={() => window.open("/test-data-manager/index", "_self")}>ログアウト</button>
          </div>
          <div id="description">
              <label>クライアント</label>
              <input type="text" readOnly={true} 
                value={`${this.state.client!.clientName}(${this.state.client!.clientKey})`} />
          </div>
          <div id="description">
              <label>ユーザ</label>
              <input type="text" readOnly={true} 
                value={`${this.state.user!.userName}(${this.state.user!.userID})`}/>
          </div>
          <div id="description">
              <label>API</label>
              <input type="text" readOnly={true} 
                value={`${this.state.api!.apiName}(${this.state.api!.apiPath})`}/>
          </div>
          <table id="main_area">
            <tbody>
              <tr>
                <td id="list_pane">
                  <table><tbody>
                    <tr id="title">
                      <td id="select_column">選択</td>
                      <td id="ts_column">時刻</td>
                      <td id="status_column">ステータス</td>
                    </tr>
                    {this.state.historyList!.map(function(h: HistoryModel) {
                      let dt = new Date(h.accessTime)
                      let curr = self.state.currentHistory
                      let id = curr && curr.id
                      return (
                        <tr key={h.id}>
                          <td id="select_column">
                            <input type="radio" checked={id == h.id} value={h.id} onClick={() => self.toSelect(h)}/>
                          </td>
                          <td id="ts_column">{dt.toLocaleTimeString()}</td>
                          <td id="status_column">{function(h:HistoryModel){
                            let resp = JSON.parse(h.responseJson)
                            return <span>{resp.status}</span>
                            }(h)}</td>
                        </tr>
                      )
                    })}
                  </tbody></table>
                </td>
                <td id="detail_pane">
                  {self.state.currentHistory && function(h: HistoryModel) {
                    let dat = new Date(h.accessTime)
                    let req = JSON.parse(h.requestJson) as RequestData
                    let res = JSON.parse(h.responseJson) as ResponseData

                    return (
                      <div>
                        <h1>詳細</h1>
                        <hr/>
                        <table id="input_pane"><tbody>
                          <tr>
                            <td colSpan={2} id="label">時刻</td>
                            <td id="value">{dat.toLocaleTimeString()}</td>
                          </tr>
                          <tr>
                            <td rowSpan={3} id="dlabel">リクエスト</td>
                            <td id="label">メソッド</td>
                            <td id="value"><input type="text" value={req.method}/></td>
                          </tr>
                          <tr>
                            <td id="label">ヘッダー</td>
                            <td id="value"><textarea value={req.headers.map((e) => `${e.name}: ${e.value}`).join("\n")}/></td>
                          </tr>
                          <tr>
                            <td id="label">ボディー</td>
                            <td id="value"><textarea value={req.body}/></td>
                          </tr>
                          <tr>
                            <td rowSpan={3} id="dlabel">レスポンス</td>
                            <td id="label">ステータス</td>
                            <td id="value"><input type="text" value={res.status}/></td>
                          </tr>
                          <tr>
                            <td id="label">ヘッダー</td>
                            <td id="value"><textarea value={res.headers.map((e) => `${e.name}: ${e.value}`).join("\n")}/></td>
                          </tr>
                          <tr>
                            <td id="label">ボディー</td>
                            <td id="value"><textarea value={res.body}/></td>
                          </tr>
                        </tbody></table>
                        <div id="button_area">
                          <button onClick={() => self.doDelete(self.state.currentHistory!)}>削除</button>
                        </div>
                      </div>
                    )
                  }(self.state.currentHistory) || <div/>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    } else {
      return <h1>Loading.....................................</h1>
    }
  }
}
