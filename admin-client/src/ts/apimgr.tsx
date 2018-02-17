import * as React from "react"
import { BrowserRouter, Route, Link, RouteComponentProps } from "react-router-dom"
import { ClientModel, UserModel, Api, ApiModel, ApiCollection  } from './common/entities'

interface ApiNewState {
  apiPath: string
  apiName: string
  condition: string
  response: string
}
interface ApiNewProps {
  onSave: (path: string, name: string, con: string, res: string) => void
  onCancel: () => void
}
class ApiNewPane extends React.Component<ApiNewProps, ApiNewState> {
  constructor(props: ApiNewProps) {
    super(props)
    this.state = {
      apiPath: "",
      apiName: "",
      condition: "",
      response: ""
    }
  }

  save() {
    this.props.onSave(this.state.apiPath, this.state.apiName, this.state.condition, this.state.response)
  }

  cancel() {
    this.props.onCancel()
  }

  render(): React.ReactNode {
    return (
      <div>
        <h1>API追加</h1>
        <table>
          <tr>
            <td><label>PATH</label></td>
            <td><input type="text" value={this.state.apiPath} onChange={(e) => this.setState({apiPath: e.target.value})}/></td>
          </tr>
          <tr>
            <td><label>詳細</label></td>
            <td><input type="text" value={this.state.apiName} onChange={(e) => this.setState({apiName: e.target.value})}/></td>
          </tr>
          <tr>
            <td><label>条件</label></td>
            <td><textarea onChange={(e) => this.setState({condition: e.target.value})}>{this.state.condition}</textarea></td>
          </tr>
          <tr>
            <td><label>レスポンス</label></td>
            <td><textarea onChange={(e) => this.setState({response: e.target.value})}>{this.state.response}</textarea></td>
          </tr>
        </table>
        <div>
          <button onClick={() => this.save()}>保存</button>
          <button onClick={() => this.cancel()}>キャンセル</button>
        </div>
      </div>
    )
  }
}

interface ApiEditState {
  apiPath: string
  apiName: string
  condition: string
  response: string
}
interface ApiEditProps {
  api: ApiModel
  onClearHistory: (api: ApiModel) => void
  onDelete: (api: ApiModel) => void
  onSave: (api: ApiModel) => void
  onCancel: () => void
}
class ApiEditPane extends React.Component<ApiEditProps, ApiEditState> {
  constructor(props: ApiEditProps) {
    super(props)
    this.state = {
      apiPath: props.api.apiPath,
      apiName: props.api.apiName,
      condition: props.api.conditionJson,
      response: props.api.responseJson
    }
  }

  componentWillReceiveProps(props: ApiEditProps, context: any) {
    this.setState({
      apiPath: props.api.apiPath,
      apiName: props.api.apiName,
      condition: props.api.conditionJson,
      response: props.api.responseJson
    })
  }
  clearHistory() {
    this.props.onClearHistory(this.props.api)
  }

  delete() {
    this.props.onDelete(this.props.api)
  }

  save() {
    this.props.api.apiPath = this.state.apiPath
    this.props.api.apiName = this.state.apiName
    this.props.api.conditionJson = this.state.condition
    this.props.api.responseJson = this.state.response

    this.props.onSave(this.props.api)
  }

  cancel() {
    this.props.onCancel()
  }

  render(): React.ReactNode {
    return (
      <div>
        <h1>API変更</h1>
        <table>
          <tr>
            <td><label>PATH</label></td>
            <td><input type="text" value={this.state.apiPath} onChange={(e) => this.setState({apiPath: e.target.value})}/></td>
          </tr>
          <tr>
            <td><label>詳細</label></td>
            <td><input type="text" value={this.state.apiName} onChange={(e) => this.setState({apiName: e.target.value})}/></td>
          </tr>
          <tr>
            <td><label>条件</label></td>
            <td><textarea onChange={(e) => this.setState({condition: e.target.value})} value={this.state.condition}></textarea></td>
          </tr>
          <tr>
            <td><label>レスポンス</label></td>
            <td><textarea onChange={(e) => this.setState({response: e.target.value})} value={this.state.response}></textarea></td>
          </tr>
        </table>
        <div>
          <button onClick={() => this.clearHistory()}>履歴削除</button>
          <button onClick={() => this.delete()}>削除</button>
          <button onClick={() => this.save()}>保存</button>
          <button onClick={() => this.cancel()}>キャンセル</button>
        </div>
      </div>
    )
  }
}

enum ApiMgrAction { NONE, NEW, EDIT }
interface ApiMgrState {
  client: ClientModel | null
  user: UserModel | null
  currentApi: ApiModel | null
  apis: ApiCollection | null
  action: ApiMgrAction
}
interface ApiMgrRoutParm {
  uid: string
}
export class ApiMgr extends React.Component<RouteComponentProps<ApiMgrRoutParm>, ApiMgrState> {
  constructor(props: RouteComponentProps<any>) {
    super(props)
    this.state = {
      client: null,
      user: null,
      currentApi: null,
      apis: null,
      action: ApiMgrAction.NONE
    }
  }

  componentDidMount() {
    let client = new ClientModel()
    client.fetch({
      success: () => this.setState({ client: client})
    })

    let user = new UserModel()
    user.url = () => `/api/users/${this.props.match.params.uid}`
    user.fetch({
      success: () => this.setState({user: user})
    })

    this.refreshApiList()
  }

  back() {
    this.props.history.goBack()
  }

  refreshApiList() {
    let apis = new ApiCollection(this.props.match.params.uid)
    apis.fetch({
      success: () => this.setState({
        apis: apis,
        action: ApiMgrAction.NONE
      })
    })
  }

  appendApi() {
    this.setState({action: ApiMgrAction.NEW})
  }

  selectApi(api: ApiModel) {
    this.setState({
      currentApi: api,
      action: ApiMgrAction.EDIT
    })
  }

  showHistory(api: ApiModel) {
    this.props.history.push(`${this.props.match.url}/${api.id}/history`)
  }

  createUser(path: string, name: string, con: string, res: string) {
    let props: Api = {
      apiPath: path,
      apiName: name,
      conditionJson: con,
      responseJson: res
    }
    this.state.apis!.create(props, {
      success: () => this.refreshApiList()
    })
  }

  deleteApi(api: ApiModel) {
    let a = this.state.apis!.get(api.id)
    a.destroy({
      success: () => this.refreshApiList()
    })
  }
  updateApi(api: ApiModel) {
    api.save(null, {
      success: () => this.refreshApiList()
    })
  }

  clearHistory(api: ApiModel) {

  }

  cancel() {
    this.setState({
      action: ApiMgrAction.NONE,
      currentApi: null
    })
  }

  render(): React.ReactNode {
    const ShowApi = (api: ApiModel) => {
      console.log(`api = ${JSON.stringify(api)}`)
      return (
        <tr key={api.id}>
          <td>
            <input type='radio'
                  checked={(this.state.currentApi && this.state.currentApi!.id) == api.id}
                  onClick={ () => this.selectApi(api)}
                  value={ api.id }/>
          </td>
          <td>{ api.apiPath }</td>
          <td>{ api.apiName }</td>
          <td>
            <button onClick={ () => this.showHistory(api) }>＞＞</button>
          </td>
        </tr>
      )
    }

    const SwitchApiPane = function(self: ApiMgr){
      switch(self.state.action) {
        case ApiMgrAction.NONE: return <div/>
        case ApiMgrAction.NEW: return <ApiNewPane onSave={(path, name, con, res) => self.createUser(path, name, con, res)}
                                                  onCancel={()=>self.cancel()}/>
        case ApiMgrAction.EDIT: return <ApiEditPane api={self.state.currentApi!} 
                                                    onCancel={() => self.cancel()}
                                                    onSave={(api:ApiModel) => self.updateApi(api)}
                                                    onClearHistory={(api:ApiModel) => self.clearHistory(api)}
                                                    onDelete={(api:ApiModel) => self.deleteApi(api)}
                                                    />
      }
    }
    if (this.state.client && this.state.apis && this.state.user) {
      return (
        <div>
          <h1>APIメンテナンス</h1>
          <div><button onClick={() => this.back()}>ユーザメンテへ</button></div>
          <div>
            <label>クライアント</label>
            <input type='text' readOnly={true} value={`${this.state.client!.clientName}(${this.state.client!.clientKey})`}/>
          </div>
          <div>
            <label>ユーザ</label>
            <input type='text' readOnly={true} value={`${this.state.user!.userName}(${this.state.user!.userID})`}/>
          </div>
          <table>
            <tbody>
            <tr>
              <td>
                <div>
                  <button onClick={ () => this.refreshApiList() }>更新</button>
                  <button onClick={ () => this.appendApi() }>追加</button>
                </div>
                <table>
                  <tbody>
                  <tr>
                    <td>選択</td>
                    <td>PATH</td>
                    <td>詳細</td>
                    <td>履歴</td>
                  </tr>
                  { this.state.apis.models.map((api) => ShowApi(api)) }
                  </tbody>
                </table>
              </td>
              <td>
                { SwitchApiPane(this) }
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
