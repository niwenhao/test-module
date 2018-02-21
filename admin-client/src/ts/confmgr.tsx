import * as React from "react"
import { BrowserRouter, Route, Link, RouteComponentProps } from "react-router-dom"
import { Config, ConfigModel, ConfigCollection  } from './common/entities'

namespace create {
  interface CreateProps {
    onSave: (name: string, value: string) => void
    onCancel: () => void
  }

  interface CreateState {
    name: string
    value: string
  }

  export class CreatePane extends React.Component<CreateProps, CreateState> {
    constructor(props: CreateProps) {
      super(props)
      this.state = {
        name: "",
        value: ""
      }
    }
    toCancel() {
      this.props.onCancel()
    }
    toSave() {
      this.props.onSave(this.state.name, this.state.value)
    }
    render() {
      return (
        <div id="input_pane">
          <table><tbody>
            <tr>
              <td id="label"><label>キー</label></td>
              <td id="value"><input type="text" value={this.state.name} onChange={(e) => this.setState({name: e.target.value})}/></td>
            </tr>
            <tr>
              <td id="label"><label>値</label></td>
              <td id="value"><textarea value={this.state.value} onChange={(e) => this.setState({value: e.target.value})}/></td>
            </tr>
          </tbody></table>
          <div id="button_area">
            <button onClick={() => this.toCancel()}>キャンセル</button>
            <button onClick={() => this.toSave()}>保存</button>
          </div>
        </div>
      )
    }
  }
}
namespace edit {
  interface EditProps {
    conf: ConfigModel
    onSave: (conf: ConfigModel) => void
    onCancel: () => void
    onDelete: (conf: ConfigModel) => void
  }

  interface EditState {
    name: string
    value: string
  }

  export class EditPane extends React.Component<EditProps, EditState> {
    constructor(props: EditProps) {
      super(props)
      this.state = {
        name: props.conf.name,
        value: props.conf.value
      }
    }

    toCancel() {
      this.props.onCancel()
    }

    toDelete() {
      this.props.onDelete(this.props.conf)
    }

    toSave() {
      let c = this.props.conf
      c.name = this.state.name
      c.value = this.state.value
      this.props.onSave(c)
    }

    componentWillReceiveProps(nextProps: EditProps, nextContext: any) {
      if (this.props.conf.id != nextProps.conf.id) {
        this.setState({
          name: nextProps.conf.name,
          value: nextProps.conf.value
        })
      }
    }

    render() {
      return (
        <div id="input_pane">
          <table><tbody>
            <tr>
              <td id="label"><label>キー</label></td>
              <td id="value"><input type="text" value={this.state.name} onChange={(e) => this.setState({name: e.target.value})}/></td>
            </tr>
            <tr>
              <td id="label"><label>値</label></td>
              <td id="value"><textarea value={this.state.value} onChange={(e) => this.setState({value: e.target.value})}/></td>
            </tr>
          </tbody></table>
          <div id="button_area">
            <button onClick={() => this.toCancel()}>キャンセル</button>
            <button onClick={() => this.toDelete()}>削除</button>
            <button onClick={() => this.toSave()}>保存</button>
          </div>
        </div>
      )
    }
  }
}
enum ACTION {
  NONE = 0, NEW, EDIT
}

interface ConfigMgrState {
  configurations: ConfigCollection | null
  current: ConfigModel | null
  action: ACTION
}

import EditPane = edit.EditPane
import NewPane = create.CreatePane

export class ConfigMgr extends React.Component<RouteComponentProps<any>, ConfigMgrState> {
  constructor(props: RouteComponentProps<any>) {
    super(props)
    this.state = {
      configurations: null,
      current: null,
      action: ACTION.NONE
    }
  }

  componentDidMount() {
    this.doRefresh()
  }

  toMenu() {
    this.props.history.goBack()
  }

  toCreate() {
    this.setState({
      current: null,
      action: ACTION.NEW
    })
  }

  toSelect(conf: ConfigModel) {
    this.setState({
      current: conf,
      action: ACTION.EDIT
    })
  }

  doCancel() {
    this.setState({
      current: null,
      action: ACTION.NONE
    })
  }

  doRefresh() {
    let c = new ConfigCollection()
    c.fetch({
      success: () => this.setState({
        configurations: c,
        current: null,
        action: ACTION.NONE
      })
    })
  }

  doCreate(name: string, value: string) {
    this.state.configurations!.create({
      name: name,
      value: value
    }, {
      success: () => this.doRefresh()
    })
  }

  doDelete(conf:ConfigModel) {
    let c = this.state.configurations!.get(conf.id)
    //this.state.configurations!.remove(c)
    c.destroy({ success: () => this.doRefresh() })
  }

  doSave(conf:ConfigModel) {
    console.log(`c => ${conf.name}`)
    conf.save({ success: () => this.doRefresh() })
  }

  render() {
    let self = this
    const SwithByAction = function(action:ACTION) {
      if (action == ACTION.NONE) {
        return <div/>
      } else if (action == ACTION.NEW) {
        return <NewPane onCancel={() => self.doCancel()} onSave={(name, value) => self.doCreate(name, value)}/>
      } else {
        return <EditPane conf={self.state.current!} onCancel={() => self.doCancel()} onDelete={(c) => self.doDelete(c)} onSave={(c) => self.doSave(c)}/>
      }
    }
    if (this.state.configurations) {
      return (
        <div id="confmgr">
          <h1>設定値管理</h1>
          <hr/>
          <div id="button_area">
            <button onClick={()=>this.toMenu()}>メニューへ</button>
            <button onClick={()=>this.toCreate()}>新規設定値</button>
            <button onClick={()=>this.doRefresh()}>再取得</button>
          </div>
          <table id="main_area"><tbody><tr>
            <td id="list_pane">
              <table><tbody>
                <tr id="title">
                  <td id="select_column">選択</td>
                  <td id="key_column">キー</td>
                  <td id="value_column">値</td>
                </tr>
                {this.state.configurations.map(function(conf) {
                  return (
                  <tr key={conf.id}>
                    <td id="select_column"><input type="radio" checked={(self.state.current && self.state.current.id == conf.id)?true:false} 
                               value={conf.id} onClick={() => self.toSelect(conf)}/></td>
                    <td id="key_column">{conf.name}</td>
                    <td id="value_column">{conf.value}</td>
                  </tr>
                  )
                })}
              </tbody></table>
            </td>
            <td id="detail_pane">
            {SwithByAction(this.state.action)}
            </td>
          </tr></tbody></table>
        </div>
      )
    } else {
      return <h1>Loading ..................................</h1>
    }

  }
}

