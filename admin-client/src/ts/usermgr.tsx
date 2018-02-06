import * as React from "react"
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom"
import { RouteComponentProps } from 'react-router'

import * as Backbone from 'backbone'


class UserModel extends Backbone.Model {
  userId: string = ""
  userName: string = ""
  password: string = ""
}

class UserCollection extends Backbone.Collection<UserModel> {
  url = "/users"
}

class ClientModel extends Backbone.Model {
  url = () => "/adminclient"
  clientKey: string = ""
  clientName: string = ""
}

interface UserEditorState {
  userId: string
  userName: string
  password: string
}

interface UserEditorLocationState {
  user: UserModel
  onCancel: () => void
  onClearHist: (u:UserModel) => void
  onRemove: (u: UserModel) => void
  onUpdate: () => void
}

class UserEditor extends React.Component<RouteComponentProps<void>, UserEditorState> {
  constructor(props: RouteComponentProps<void>) {
    super(props)
    this.state = {
      userId: "",
      userName: "",
      password: ""
    }
  }

  user : UserModel | null = null

  locationState?: UserEditorLocationState

  componentDidMount() {
    this.locationState = this.props.location.state
    this.setState({
      userId: this.locationState!.user.userId,
      userName: this.locationState!.user.userName,
      password: this.locationState!.user.password
    })
  }

  componentWillUnmount() {
    this.locationState = undefined
  }

  remove() {
    this.locationState!.onRemove(this.locationState!.user)
  }

  clearHist() {
    this.locationState!.onClearHist(this.locationState!.user)
  }

  update() {
    if (this.locationState!.user) {
      this.locationState!.user.userName = this.state.userName
      this.locationState!.user.userId = this.state.userId
      this.locationState!.user.password = this.state.password

      this.locationState!.user.save({ success: () => {
        this.locationState!.onUpdate()
      }})
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <h2>ユーザ編集</h2>
        <div>
          <label>ユーザID</label>
          <input type="text" value={this.state.userId} onChange = {(e:any) => this.setState({userId: e.target.value})} />
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
        </div>
      </div>
    )
  }
}

interface UserMgrState {
  currentUser: UserModel | null
  users: UserCollection | null
  client: ClientModel | null
}

interface UserNewLocationState {
  onCancel: ()=> void
  onSave: (id:string, name:string, password:string)=> void
}

export class UserMgr 
        extends React.Component<RouteComponentProps<any>, UserMgrState> 
{
  constructor(props:RouteComponentProps<any>) {
    super(props)
    this.state = {
      currentUser: null,
      users: null,
      client: null
    }
  }

  componentDidMount():void {
    console.log("componentDidMount")
    let users = new UserCollection()
    users.fetch({
      success: () => {
        this.setState({
          users: users
        })
      }
    })
    let client = new ClientModel()
    client.fetch({
      success: () => {
        this.setState( {
          client: client
        })
      }
    })
  }

  logout() {

  }

  newUser() {
    let state: UserNewLocationState = {
      onCancel: () => this.props.history.goBack(),
      onSave: (id, name, password) => {
        this.state.users!.create({
          userId: id,
          userName: name,
          password: password
        }, {
          success: () => {
            let users = new UserCollection()
            users.fetch({
              success: () => {
                this.setState({users: users})
              }
            })
          }
        })
        this.props.history.goBack()
      }
    }
    this.props.history.push(`${this.props.match}`, {
      addUser: (identify: string, name: string, password: string) => {
        this.state.users!.create({
          userId: identify,
          userName: name,
          password: password
        }, { success: () => {
          let users = new UserCollection()
          users.fetch({
            success: () => {
              this.setState({users: users})
            }
          })
        }})
      }
    })
  }

  clearUserHistory(user: UserModel) {

  }

  selectUser(u:UserModel) {
    let state:UserEditorLocationState = {
      user: u,
      onCancel: () => this.props.history.goBack(),
      onClearHist: (u) => this.clearUserHistory(u),
      onRemove: (u) => {
        u.destroy({
          success: () => {
            let users = new UserCollection()
            users.fetch({
              success: () => {
                this.setState({users: users})
              }
            })
          }
        },
      )},
      onUpdate: () => {
        let users = new UserCollection()
        users.fetch({
          success: () => {
            this.setState({users: users})
          }
        })
      }
    }
  }

  clearAllHistory() {
  }

  showApi(u: UserModel) {
    this.props.history.push(`${this.props.match.url}/${u.userId}/api`)
  }

  render(): React.ReactNode {
    const UserList: React.SFC<{
      users: UserCollection | null,
      onSelect: (user: UserModel) => void, 
      onShowAPI: (user: UserModel) => void
    }> = (props) => (
      <div>
        <div>
          <table>
            <tbody>
              <tr>
                <td>選択</td>
                <td>ユーザID</td>
                <td>ユーザ名</td>
                <td>API</td>
              </tr>
              { props.users!.models.map(
                  function(u:UserModel): React.ReactNode {
                    return (
                      <tr key={u.userId}>
                        <td><input type="radio" name="selectUser" value={u.userId} onClick={ () => props.onSelect(u) }/></td>
                        <td>{u.userId}</td>
                        <td>{u.userName}</td>
                        <a onClick={ () => props.onShowAPI(u) }>＞＞</a>
                      </tr>
                    )
                  }
                )}
            </tbody>
          </table>
        </div>
      </div>
    )

    const UserNew: React.SFC<RouteComponentProps<void>> = function(props) {
      var identify = ""
      var name = ""
      var password = ""
      let state = props.location.state as UserNewLocationState
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
            <button onClick={() => state.onCancel()}>キャンセル</button>
            <button onClick={() => state.onSave(identify, name, password)}>保存</button>
          </div>
        </div>
      )
    }

    if (this.state.client && this.state.users) {
      return (
        <Router>
        <div>
          <h1>ユーザメインテナンス</h1>
          <span>
            <div>
            <label>クライアント</label>
            <input type="text" readOnly={true} value={this.state.client!.clientName + "(" + this.state.client!.clientKey + ")"}/>
            <button type="button" onClick={ () => this.logout() }>ログアウト</button>
            </div>
            <div>
              <button type="button" onClick={ () => this.newUser() }>追加</button>
              <UserList users={ this.state.users } onSelect={ u => this.selectUser(u) } onShowAPI={ u => this.showApi(u) }/>
            </div>
          </span>
          <span>
            <div>
              <button type="button" onClick={ () => this.clearAllHistory() }>全履歴クリア</button>
            </div>
            <Route exact path={`${this.props.match.url}`} render={()=><div/>}/>
            <Route path={`${this.props.match.url}/editor`} component={UserEditor}/>
            <Route path={`${this.props.match.url}/new`} component={UserNew}/>
          </span>
        </div>
        </Router>
      )
    } else {
      return <div>User data loading ..................................</div>
    }
  }
}
