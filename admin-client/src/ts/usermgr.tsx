import * as React from "react"
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom"
import { RouteComponentProps } from 'react-router'

import { User, UserModel, UserCollection, ClientModel } from './common/entities'

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
    this.props.user.userName = this.state.userName
    this.props.user.userID = this.state.userID
    this.props.user.password = this.state.password

    this.props.user.save(null, { success: () => {
      console.log(`success to update usermodel`)
      this.props.onUpdate()
    }})
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
      <div>
        <h2>ユーザ編集</h2>
        <div>
          <label>ユーザID</label>
          <input type="text" value={this.state.userID} onChange = {(e:any) => this.setState({userID: e.target.value})} />
        </div>
        <div>
          <label>ユーザ名</label>
          <input type="text" value={this.state.userName} onChange = {(e:any) => this.setState({userName: e.target.value})} />
        </div>
        <div>
          <label>パスワード</label>
          <input type="password" value={this.state.password} onChange = {(e:any) => this.setState({password: e.target.value})} />
        </div>
        <div>
          <button onClick={() => this.clearHist()}>履歴クリア</button>
          <button onClick={() => this.remove()}>削除</button>
          <button onClick={() => this.update()}>保存</button>
          <button onClick={this.props.onCancel}>キャンセル</button>
        </div>
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
              <tr>
                <td>選択</td>
                <td>ユーザID</td>
                <td>ユーザ名</td>
                <td>API</td>
              </tr>
              { this.props.users!.models.map(
                  function(u:UserModel): React.ReactNode {
                    return (
                      <tr key={u.userID}>
                        <td>
                          <input type="radio" name="selectUser" value={u.userID}
                                 onClick={ () => self.selectUser(u) } 
                                 checked={u.userID == self.state.checkedUserID}
                                 onChange={(e) => self.setState({ checkedUserID: e.target.value }) }/>
                        </td>
                        <td>{u.userID}</td>
                        <td>{u.userName}</td>
                        <td><a onClick={ () => self.showApis(u) }>＞＞</a></td>
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
      }
    })
  }

  logout() {

  }

  refreshUserList() {
    let users = new UserCollection()
    users.fetch({
      success: () => {
        this.setState({users: users, action: UserMgrAction.NONE})
      }
    })
  }

  newUser() {
    this.setState({action: UserMgrAction.NEW})
  }

  createUser(id: string, name: string, pwd: string) {
    let u = new UserModel({
      userID: id,
      userName: name,
      password: pwd
    })

    this.state.users!.create(u, {
      success: () => {
        this.refreshUserList()
      }
    })
  }

  removeUser(user:UserModel) {
    let u = this.state.users!.get(user.id)
    u.destroy({
      success: () => this.refreshUserList()
    })
  }

  clearUserHistory(user: UserModel) {

  }

  selectUser(u:UserModel) {
    this.setState({
      currentUser: u,
      action: UserMgrAction.EDIT
    })
  }

  clearAllHistory() {
  }

  showApi(u: UserModel) {
    this.props.history.push(`${this.props.match.url}/users/${u.id}/apis`)
  }

  render(): React.ReactNode {

    const UserNew: React.SFC<UserNewProps> = function(props) {
      var identify = ""
      var name = ""
      var password = ""
      return (
        <div>
          <h2>ユーザ編集</h2>
          <div>
            <label>ユーザID</label>
            <input type="text" onChange = {(e:any) => identify = e.target.value} />
          </div>
          <div>
            <label>ユーザ名</label>
            <input type="text" onChange = {(e:any) => name = e.target.value} />
          </div>
          <div>
            <label>パスワード</label>
            <input type="password" onChange = {(e:any) => password=e.target.value} />
          </div>
          <div>
            <button onClick={() => props.onCancel()}>キャンセル</button>
            <button onClick={() => props.onSave(identify, name, password)}>保存</button>
          </div>
        </div>
      )
    }

    if (this.state.client && this.state.users) {
      return (
        <div>
          <h1>ユーザメンテナンス</h1>
          <div>
            <label>クライアント</label>
            <input type="text" readOnly={true} value={this.state.client}/>
            <button type="button" onClick={ () => this.logout() }>ログアウト</button>
            <button type="button" onClick={ () => this.clearAllHistory() }>全履歴クリア</button>
          </div>
          <table>
            <tbody>
            <tr>
              <td>
                <div>
                  <button type="button" onClick={ () => this.newUser() }>追加</button>
                  <button type="button" onClick={ () => this.refreshUserList() }>再取得</button>
                  <UserList users={ this.state.users } onSelect={ u => this.selectUser(u) } onShowAPI={ u => this.showApi(u) }/>
                </div>
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
