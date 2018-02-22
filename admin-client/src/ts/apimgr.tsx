import * as React from "react"
import * as JQuery from "jquery"
import { BrowserRouter, Route, Link, RouteComponentProps } from "react-router-dom"
import { ClientModel, UserModel, Api, ApiModel, ApiCollection, RequestData, ResponseData, errorHandler } from './common/entities'

interface ApiNewState {
  apiPath: string
  apiName: string
  condition: string
  status: string;
  headers: string;
  body: string;
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
      status: "200",
      headers: "",
      body: ""
    }
  }

  save() {
    let responseData : ResponseData = {
      status: parseInt(this.state.status),
      headers: this.state.headers.split(/\n/).filter(function(u) {
        return u.match(/^.+:.+$/) != null
      }).map(function(u: string) {
        let index = u.indexOf(":")
        return {
          name: u.substring(0, index),
          value: u.substring(index + 1).replace(/^ */, "")
        }
      }),
      body: this.state.body
    }

    this.props.onSave(this.state.apiPath, this.state.apiName, this.state.condition, JSON.stringify(responseData))
  }

  cancel() {
    this.props.onCancel()
  }

  render(): React.ReactNode {
    return (
      <div id="detail_pane">
        <h2>API追加</h2>
        <hr/>
        <table id="input_pane">
          <tr>
            <td id="label"><label>PATH</label></td>
            <td id="value"><input type="text" value={this.state.apiPath} onChange={(e) => this.setState({apiPath: e.target.value})}/></td>
          </tr>
          <tr>
            <td id="label"><label>詳細</label></td>
            <td id="value"><input type="text" value={this.state.apiName} onChange={(e) => this.setState({apiName: e.target.value})}/></td>
          </tr>
          <tr>
            <td id="label"><label>条件</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({condition: e.target.value})} value={this.state.condition}></textarea></td>
          </tr>
          <tr>
            <td id="label"><label>ステータス</label></td>
            <td id="value"><input type="text" onChange={(e) => this.setState({status: e.target.value})} value={this.state.status}/></td>
          </tr>
          <tr>
            <td id="label"><label>ヘッダー</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({headers: e.target.value})} value={this.state.headers}></textarea></td>
          </tr>
          <tr>
            <td id="label"><label>ボディ</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({body: e.target.value})} value={this.state.body}></textarea></td>
          </tr>
        </table>
        <div id="button_area">
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
  status: string;
  headers: string;
  body: string;
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

    let responseData = JSON.parse(props.api.responseJson) as ResponseData

    this.state = {
      apiPath: props.api.apiPath,
      apiName: props.api.apiName,
      condition: props.api.conditionJs,
      status: responseData.status.toString(),
      headers: responseData.headers.map((u)=> `${u.name}: ${u.value}`).join("\n"),
      body: responseData.body
    }
  }

  componentWillReceiveProps(props: ApiEditProps, context: any) {
    let responseData = JSON.parse(props.api.responseJson) as ResponseData

    this.setState({
      apiPath: props.api.apiPath,
      apiName: props.api.apiName,
      condition: props.api.conditionJs,
      status: responseData.status.toString(),
      headers: responseData.headers.map((u)=> `${u.name}: ${u.value}`).join("\n"),
      body: responseData.body
    })
  }
  clearHistory() {
    this.props.onClearHistory(this.props.api)
  }

  delete() {
    this.props.onDelete(this.props.api)
  }

  save() {
    let responseData : ResponseData = {
      status: parseInt(this.state.status),
      headers: this.state.headers.split(/\n/).filter(function(u) {
        return u.match(/^.+:.+$/) != null
      }).map(function(u: string) {
        let index = u.indexOf(":")
        return {
          name: u.substring(0, index),
          value: u.substring(index + 1).replace(/^ */, "")
        }
      }),
      body: this.state.body
    }

    this.props.api.apiPath = this.state.apiPath
    this.props.api.apiName = this.state.apiName
    this.props.api.conditionJs = this.state.condition
    this.props.api.responseJson = JSON.stringify(responseData)

    this.props.onSave(this.props.api)
  }

  cancel() {
    this.props.onCancel()
  }

  render(): React.ReactNode {
    return (
      <div id="detail_pane">
        <h1>API変更</h1>
        <table id="input_pane">
          <tr>
            <td id="label"><label>PATH</label></td>
            <td id="value"><input type="text" value={this.state.apiPath} onChange={(e) => this.setState({apiPath: e.target.value})}/></td>
          </tr>
          <tr>
            <td id="label"><label>詳細</label></td>
            <td id="value"><input type="text" value={this.state.apiName} onChange={(e) => this.setState({apiName: e.target.value})}/></td>
          </tr>
          <tr>
            <td id="label"><label>条件</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({condition: e.target.value})} value={this.state.condition}></textarea></td>
          </tr>
          <tr>
            <td id="label"><label>ステータス</label></td>
            <td id="value"><input type="text" onChange={(e) => this.setState({status: e.target.value})} value={this.state.status}/></td>
          </tr>
          <tr>
            <td id="label"><label>ヘッダー</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({headers: e.target.value})} value={this.state.headers}></textarea></td>
          </tr>
          <tr>
            <td id="label"><label>ボディ</label></td>
            <td id="value"><textarea onChange={(e) => this.setState({body: e.target.value})} value={this.state.body}></textarea></td>
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
      success: () => this.setState({ client: client}),
      error: errorHandler("クライアント定義取得が失敗しました。原因は以下です。\n")
    })

    let user = new UserModel()
    user.url = () => `/api/users/${this.props.match.params.uid}`
    user.fetch({
      success: () => this.setState({user: user}),
      error: errorHandler("ユーザ取得が失敗しました。原因は以下です。\n")
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
      }),
      error: errorHandler("API一覧取得が失敗しました。原因は以下です。\n")
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

  createApi(path: string, name: string, con: string, res: string) {
    let props: Api = {
      apiPath: path,
      apiName: name,
      conditionJs: con,
      responseJson: res
    }
    this.state.apis!.create(props, {
      success: () => this.refreshApiList(),
      error: errorHandler("作成処理が失敗しました。原因は以下です。\n")
    })
  }

  deleteApi(api: ApiModel) {
    let a = this.state.apis!.get(api.id)
    a.destroy({
      success: () => this.refreshApiList(),
      error: errorHandler("削除処理が失敗しました。原因は以下です。\n")
    })
  }
  updateApi(api: ApiModel) {
    api.save(null, {
      success: () => this.refreshApiList(),
      error: errorHandler("保存処理は失敗しました。原因は以下です。\n")
    })
  }

  clearHistory(api: ApiModel) {
    JQuery.ajax({
      url: `/api/hist/api/${api.id}`,
      method: "DELETE",
      success: (data: {result: boolean, message: string}) => {
        if (data.result) {
          alert("Remove successed.")
        } else {
          alert("Remove failed.")
        }
      }
    })
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
          <td id="select_column">
            <input type='radio'
                  checked={(this.state.currentApi && this.state.currentApi!.id) == api.id}
                  onClick={ () => this.selectApi(api)}
                  value={ api.id }/>
          </td>
          <td id="path_column"  >{ api.apiPath }</td>
          <td id="name_column"  >{ api.apiName }</td>
          <td id="sub_column"   >
            <button onClick={ () => this.showHistory(api) }>＞＞</button>
          </td>
        </tr>
      )
    }

    const SwitchApiPane = function(self: ApiMgr){
      switch(self.state.action) {
        case ApiMgrAction.NONE: return <div/>
        case ApiMgrAction.NEW: return <ApiNewPane onSave={(path, name, con, res) => self.createApi(path, name, con, res)}
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
        <div id="apimgr">
          <h1>APIメンテナンス</h1>
          <hr/>
          <div id="button_area">
            <button onClick={() => this.back()}>ユーザメンテへ</button>
            <button onClick={ () => this.refreshApiList() }>更新</button>
            <button onClick={ () => this.appendApi() }>追加</button>
            <button onClick={() => window.open("/test-data-manager/index", "_self")}>ログアウト</button>
          </div>
          <div id="description">
            <label>クライアント</label>
            <input type='text' readOnly={true} value={`${this.state.client!.clientName}(${this.state.client!.clientKey})`}/>
          </div>
          <div id="description">
            <label>ユーザ</label>
            <input type='text' readOnly={true} value={`${this.state.user!.userName}(${this.state.user!.userID})`}/>
          </div>
          <table id="main_area">
            <tbody>
            <tr>
              <td id="list_pane">
                <table>
                  <tbody>
                  <tr id="title">
                    <td id="select_column">選択</td>
                    <td id="path_column"  >PATH</td>
                    <td id="name_column"  >詳細</td>
                    <td id="sub_column"   >履歴</td>
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
