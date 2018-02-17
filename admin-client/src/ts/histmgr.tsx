import * as React from "react"
import * as Backbone from 'backbone'

import { ClientModel ,UserModel, ApiModel, HistoryModel, HistoryCollection } from './common/entities'
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
    this.state.historyList!.remove(h)
    h.destroy({ success: () => this.refresh()})
  }

  render(): React.ReactNode {
    let self = this
    if (this.state.client && this.state.user && this.state.api && this.state.historyList) {
      return (
        <div>
          <h1>呼出履歴メンテナンス</h1>
          <table>
            <tbody>
              <tr>
                <td><button onClick={() => this.props.history.goBack()}>APIメンテへ</button></td>
              </tr>
            </tbody>
          </table>
          <table><tbody>
            <tr><td>
              <label>クライアント</label>
            </td><td>
              <input type="text" readOnly={true} 
                value={`${this.state.client!.clientName}(${this.state.client!.clientKey})`}/>
            </td></tr>
            <tr><td>
              <label>ユーザ</label>
            </td><td>
              <input type="text" readOnly={true} 
                value={`${this.state.user!.userName}(${this.state.user!.userID})`}/>
            </td></tr>
            <tr><td>
              <label>API</label>
            </td><td>
              <input type="text" readOnly={true} 
                value={`${this.state.api!.apiName}(${this.state.api!.apiPath})`}/>
            </td></tr>
          </tbody></table>
          <table>
            <tbody>
              <tr>
                <td>
                  <table><tbody>
                    <tr>
                      <td>選択</td>
                      <td>時刻</td>
                      <td>ステータス</td>
                    </tr>
                    {this.state.historyList!.map(function(h: HistoryModel) {
                      let dt = new Date(h.accessTime)
                      let curr = self.state.currentHistory
                      let id = curr && curr.id
                      return (
                        <tr key={h.id}>
                          <td>
                            <input type="radio" checked={id == h.id} value={h.id}/>
                          </td>
                          <td>{dt.toLocaleDateString()}</td>
                          <td>{function(h:HistoryModel){
                            let resp = JSON.parse(h.responseJson)
                            return <span>{resp.status}</span>
                            }(h)}</td>
                        </tr>
                      )
                    })}
                  </tbody></table>
                </td>
                <td>
                  {self.state.currentHistory && function(h: HistoryModel) {
                    let dat = new Date(h.accessTime)

                    return (
                      <div>
                        <h1>詳細</h1>
                        <table><tbody>
                          <tr>
                            <td><label>時刻</label></td>
                            <td><input readOnly={true} value={dat.toDateString()}/></td>
                          </tr>
                          <tr>
                            <td><label>リクエスト</label></td>
                            <td><textarea readOnly={true} value={h.requestJson}/></td>
                          </tr>
                          <tr>
                            <td><label>レスポンス</label></td>
                            <td><textarea readOnly={true} value={h.responseJson}/></td>
                          </tr>
                        </tbody></table>
                        <div>
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
