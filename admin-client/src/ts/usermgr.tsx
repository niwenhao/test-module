import * as React from "react"
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom"
import { RouteComponentProps } from 'react-router'

import { User, UserModel, UserCollection, ClientModel, errorHandler } from './common/entities'
import * as JQuery from "jquery"

interface UserEditorState {
  userID: string
  userName: string
  password: string
}

interface UserEditorProps {
  user: UserModel
  onCancel: () => void
  onClearHist: (u:UserModel) => void
  onUpdate: () => void
  onRemove: (u: UserModel) => void
}

class UserEditor extends React.Component<UserEditorProps, UserEditorState> {
  constructor(props: UserEditorProps) {
    super(props)
    this.state = {
      userID: props.user.userID,
      userName: props.user.userName,
      password: props.user.password
    }
  }

  remove() {
    this.props.onRemove(this.props.user)
  }

  clearHist() {
    this.props.onClearHist(this.props.user)
  }

  update() {
    if (confirm("入力内容を保存しますか？")) {
      this.props.user.userName = this.state.userName
      this.props.user.userID = this.state.userID
      this.props.user.password = this.state.password

      this.props.user.save(null, { success: () => {
          console.log(`success to update usermodel`)
          this.props.onUpdate()
        },
        error: errorHandler("保存処理は失敗しました。原因は以下です。\n", "", { refresh: () => this.props.onUpdate() })
      })
    }
  }

  componentWillReceiveProps(props: UserEditorProps, nextContext: any) {
    this.setState({
      userID: props.user.userID,
      userName: props.user.userName,
      password: props.user.password
    })
  }

  render(): React.ReactNode {
    return (
      <div id="detail_pane">
        <div className="title_bar">ユーザ編集</div>
        <table id="input_pane"><tbody>
          <tr>
            <td id="label"><label>ユーザID</label></td>
            <td id="value"><input type="text" value={this.state.userID} onChange = {(e:any) => this.setState({userID: e.target.value})} /></td>
          </tr>
          <tr>
            <td id="label"><label>ユーザ名</label></td>
            <td id="value"><input type="text" value={this.state.userName} onChange = {(e:any) => this.setState({userName: e.target.value})} /></td>
          </tr>
          <tr>
            <td id="label"><label>パスワード</label></td>
            <td id="value"><input type="password" value={this.state.password} onChange = {(e:any) => this.setState({password: e.target.value})} /></td>
          </tr>
          <tr><td colSpan={2} id="button_area">
            <button onClick={() => this.clearHist()}>履歴削除</button>
            <button onClick={() => this.remove()}>削除</button>
            <button onClick={() => this.update()}>保存</button>
            <button onClick={this.props.onCancel}>キャンセル</button>
          </td></tr>
        </tbody></table>
      </div>
    )
  }
}

enum UserMgrAction { NONE = 1, NEW, EDIT }
interface UserMgrState {
  currentUser: UserModel | null
  users: UserCollection | null
  client: string | null
  action: UserMgrAction
}

interface UserNewProps {
  onCancel: ()=> void
  onSave: (id:string, name:string, password:string)=> void
}

interface UserListState {
  checkedUserID: string | null
}

interface UserListProps {
    users: UserCollection | null
    onSelect: (user: UserModel) => void
    onShowAPI: (user: UserModel) => void
}

class UserList extends React.Component<UserListProps, UserListState>
{
  constructor(props: UserListProps) {
    super(props)
    this.state = {
      checkedUserID: null
    }
  }

  componentWillReceiveProps(nextProps: UserListProps, nextContext: any) {
    console.log("componentWillReceiveProps")
    this.props.users !== nextProps.users && this.setState({
      checkedUserID: null
    })
  }

  selectUser(u: UserModel) {
    this.props.onSelect(u)
  }

  showApis(u: UserModel) {
    this.props.onShowAPI(u)
  }

  render(): React.ReactNode {
    let self = this
    if (this.props.users) {
      return (
        <div>
          <table>
            <tbody>
              <tr id="title">
                <td id="select_column">選択</td>
                <td id="userid_column">ユーザID</td>
                <td id="username_column">ユーザ名</td>
                <td id="sub_column">API</td>
              </tr>
              { this.props.users!.models.map(
                  function(u:UserModel): React.ReactNode {
                    return (
                      <tr key={u.userID}>
                        <td id="select_column">
                          <input type="radio" name="selectUser" value={u.userID}
                                 onClick={ () => self.selectUser(u) } 
                                 checked={u.userID == self.state.checkedUserID}
                                 onChange={(e) => self.setState({ checkedUserID: e.target.value }) }/>
                        </td>
                        <td id="userid_column">{u.userID}</td>
                        <td id="username_column">{u.userName}</td>
                        <td id="sub_column"><button onClick={ () => self.showApis(u) }>＞＞</button></td>
                      </tr>
                    )
                  }
                )}
            </tbody>
          </table>
        </div>
      )
    } else {
      return <div/>
    }
  }

}

export class UserMgr 
        extends React.Component<RouteComponentProps<any>, UserMgrState> 
{
  constructor(props:RouteComponentProps<any>) {
    super(props)
    this.state = {
      currentUser: null,
      users: null,
      client: null,
      action: UserMgrAction.NONE
    }
  }

  componentDidMount():void {
    this.refreshUserList()
    let client = new ClientModel()
    client.fetch({
      success: () => {
        this.setState({ client: `${client.clientName}(${client.clientKey})`})
      },
      error: errorHandler("クライアント定義取得が失敗しました。原因は以下です。\n")
    })
  }

  logout() {

  }

  refreshUserList() {
    let users = new UserCollection()
    users.fetch({
      success: () => {
        this.setState({users: users, action: UserMgrAction.NONE})
      },
      error: errorHandler("ユーザ一覧取得が失敗しました。原因は以下です。\n")
    })
  }

  newUser() {
    this.setState({action: UserMgrAction.NEW})
  }

  createUser(id: string, name: string, pwd: string) {
    if (confirm("入力内容を保存しますか？")) {
      let u = new UserModel({
        userID: id,
        userName: name,
        password: pwd
      })

      this.state.users!.create(u, {
        success: () => {
          this.refreshUserList()
        },
        error: errorHandler("ユーザ作成が失敗しました。原因は以下です。\n", "", { refresh: () => this.refreshUserList() })
      })
    }
  }

  removeUser(user:UserModel) {
    if (confirm(`ユーザ(${user.userID})を削除しますか？`)) {
      let u = this.state.users!.get(user.id)
      u.destroy({
        success: () => this.refreshUserList(),
        error: errorHandler("ユーザ削除が失敗しました。原因は以下です。\n", "", { refresh: () => this.refreshUserList() })
      })
    }
  }

  clearUserHistory(user: UserModel) {
    if (confirm(`ユーザ(${user.userID})のすべてのAPI呼出し履歴を削除しますか？`)) {
      JQuery.ajax({
        url: `/test-data-manager/api/hist/user/${user.id}`,
        method: "DELETE",
        success: (data: {result: boolean, message: string}) => {
          if (data.result) {
            alert(`ユーザ（${this.state.currentUser!.userName}）のAPIの呼出履歴情報を削除しました。`)
          } else {
            alert(`ユーザ(${this.state.currentUser!.userName})のAPI呼出履歴の削除が失敗しました。`)
          }
        }
      })
    }
  }

  selectUser(u:UserModel) {
    this.setState({
      currentUser: u,
      action: UserMgrAction.EDIT
    })
  }

  clearAllHistory() {
    if (confirm(`クライアントキー(${this.state.client})のすべてのAPI呼び出し履歴を削除しますか？`)) {
      JQuery.ajax({
        url: "/test-data-manager/api/hist/client",
        method: "DELETE",
        success: (data: {result: boolean, message: string}) => {
          if (data.result) {
            alert(`クライアント定義(${this.state.client})のAPIの呼出履歴情報を削除しました。`)
          } else {
            alert(`クライアント定義(${this.state.client})のAPI呼出履歴の削除が失敗しました。`)
          }
        }
      })
    }
  }

  showApi(u: UserModel) {
    this.props.history.push(`${this.props.match.url}/${u.id}/apis`)
  }

  render(): React.ReactNode {

    const UserNew: React.SFC<UserNewProps> = function(props) {
      var identify = ""
      var name = ""
      var password = ""
      return (
        <div id="detail_pane">
          <div className="title_bar">ユーザ追加</div>
          <table id="input_pane"><tbody>
            <tr>
              <td id="label"><label>ユーザID</label></td>
              <td id="value"><input type="text" onChange = {(e:any) => identify = e.target.value} /></td>
            </tr>
            <tr>
              <td id="label"><label>ユーザ名</label></td>
              <td id="value"><input type="text" onChange = {(e:any) => name = e.target.value} /></td>
            </tr>
            <tr>
              <td id="label"><label>パスワード</label></td>
              <td id="value"><input type="password" onChange = {(e:any) => password=e.target.value} /></td>
            </tr>
            <tr>
              <td colSpan={2} id="button_area">
                <button onClick={() => props.onCancel()}>キャンセル</button>
                <button onClick={() => props.onSave(identify, name, password)}>保存</button>
              </td>
            </tr>
          </tbody></table>
        </div>
      )
    }

    if (this.state.client && this.state.users) {
      return (
        <div id="usermgr">
          <h1>ユーザメンテナンス</h1>
          <hr/>
          <div id="button_area">
            <button onClick={() => this.props.history.goBack()}>メニューへ</button>
            <button type="button" onClick={ () => this.refreshUserList() }>再取得</button>
            <button type="button" onClick={ () => this.newUser() }>追加</button>
            <button onClick={ () => this.clearAllHistory() }>全履歴削除</button>
            <button onClick={() => window.open("/test-data-manager/index", "_self")}>ログアウト</button>
          </div>
          <div id="description">
            <div>
              <label>クライアント</label>
              <input type="text" readOnly={true} value={this.state.client}/>
            </div>
          </div>
          <table id="main_area">
            <tbody>
            <tr>
              <td id="list_pane">
                  <UserList users={ this.state.users } onSelect={ u => this.selectUser(u) } onShowAPI={ u => this.showApi(u) }/>
              </td>
              <td>
                <div>
                  {
                    this.state.action == UserMgrAction.NONE ? 
                      <div/> 
                      : 
                      this.state.action == UserMgrAction.NEW ? 
                        <UserNew onCancel={() => this.setState({ action: UserMgrAction.NONE })}
                                onSave={(id, name, pwd) => { this.createUser(id, name, pwd)}}
                                />
                        :
                        <UserEditor user={this.state.currentUser!}
                                    onCancel={() => this.setState({ action: UserMgrAction.NONE })}
                                    onClearHist={(u) => this.clearUserHistory(u)}
                                    onUpdate={() => this.refreshUserList()}
                                    onRemove={(u) => this.removeUser(u)}
                                    />

                  }
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      )
    } else {
      return <div>User data loading ..................................</div>
    }
  }
}
