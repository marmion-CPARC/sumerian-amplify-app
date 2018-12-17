import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { withAuthenticator } from 'aws-amplify-react';

import { XR } from 'aws-amplify';
import sceneConfig from './sumerian-exports';

XR.configure({ // XR category configuration
  SumerianProvider: { // Sumerian specific configuration
    region: 'us-east-1', // Sumerian region
    scenes: {
      "scene1": { // Friendly scene name
        sceneConfig // Scene configuration from Sumerian publish
      }
    },
  }
});

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
        loading: true,
        sceneController: null
    };
}

sceneLoaded(sceneController) {
  this.setState({
      loading: false,
      sceneController
  });
}

  async componentDidMount() {
    await XR.loadScene("scene1", "sumerian-scene-dom-id");
    XR.start("scene1");
  }
  render() {
    return (
        <div className="App">
            {this.state.loading && <IndeterminateLoading/>}
            <div style={{visibility: this.state.loading && 'hidden'}}>
                <SceneControls sceneController={this.state.sceneController}/>
                <SumerianScene scene='scene1' onLoaded={(controller) => this.sceneLoaded(controller)}/>
            </div>
        </div>
    );
  }
}

function IndeterminateLoading() {
  return <img src={logo} className="App-logo" alt="logo"/>;
}

class SumerianScene extends Component {

  async componentDidMount() {
      await this.loadAndStartScene();
  }

  render() {
      return <div
          id="sumerian-scene-dom-id"
          style={{width: "100%", height: "100%", position: "absolute"}}
      />;
  }

  async loadAndStartScene() {
      await XR.loadScene(this.props.scene, "sumerian-scene-dom-id");
      const controller = XR.getSceneController(this.props.scene);
      this.props.onLoaded(controller);
      XR.start(this.props.scene);
  }

}

function LabelledInput({label, type, onChange}) {
  return (
      <label>
          {label}
          <input type={type} onChange={(event) => onChange(event.target.value)}/>
      </label>
  );
}

function TextInput({label, onChange}) {
  return <LabelledInput label={label} type="text" onChange={onChange}/>
}

function ColorInput({label, onChange}) {
    return <LabelledInput label={label} type="color" onChange={onChange}/>;
}

class SceneControls extends Component {

  emit(channelName, value) {
      if (((this.props.sceneController || {}).sumerian || {}).SystemBus) {
          this.props.sceneController.sumerian.SystemBus.emit(channelName, value)
      }
  }

  updateSphereName(value) {
      this.emit("updateSphereName", value);
  }

  updateSphereColor(value) {
    this.emit("updateSphereColor", value);
  }

  render() {
    return (
        <div>
            <TextInput label="Sphere name" onChange={(value) => this.updateSphereName(value)}/>
            <ColorInput label="Sphere color" onChange={(value) => this.updateSphereColor(value)}/>
        </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });