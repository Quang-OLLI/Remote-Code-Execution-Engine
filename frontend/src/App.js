import React from "react";
import "./App.css";
import AceEditor from "react-ace";
import { Select, Row, Col, Input } from "antd";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import axios from "axios";
import logo from "./assets/logo.png";

const { Option } = Select;
const { TextArea } = Input;

const cTemplate = `#include<stdio.h>
                                   
int main() {
               
     // Enter your code here
                                     
     return 0;
}`;

const cppTemplate = `#include<bits/stdc++.h>
                           
using namespace std;
                                   
int main() {
               
     // Enter your code here
                                     
     return 0;
}`;

class App extends React.Component {
     constructor(props) {
          super(props);
          this.state = {
               lang: "cpp",
               code: cppTemplate,
               input: "",
               output: "",
               btnState: false
          };
          this.handleChange = value => {
               this.setState({
                    code: value
               });
          };
          this.selectLanguage = lang => {
               if (lang === "c") {
                    this.setState({
                         lang: lang,
                         code: cTemplate
                    });
               } else {
                    this.setState({
                         lang,
                         code: cppTemplate
                    });
               }
          };
          this.handleIOChange = e => {
               this.setState({
                    input: e.target.value
               });
          };
          this.submitCode = e => {
               console.log("Submitting...");
               this.setState({
                    btnState: true
               });
               const data = {
                    code: this.state.code,
                    input: this.state.input
               };
               axios.post(`/${this.state.lang}`, data).then(op => {
                    if (op.data.error === "NIL") {
                         this.setState({
                              output: op.data.output,
                              btnState: false
                         });
                    } else {
                         this.setState({
                              output: op.data.error,
                              btnState: false
                         });
                    }
               });
          };
     }
     render() {
          return (
               <div className="App">
                    <nav>
                         <h1>
                              <img src={logo} width="70px" />
                              Safe Exec{" "}
                         </h1>
                    </nav>
                    <p>Let your code execute in Stealth Mode!</p>
                    <Row>
                         <Col sm={24} md={12}>
                              <Select
                                   defaultValue={this.state.lang}
                                   style={{ width: 150, marginLeft: "20px" }}
                                   onChange={this.selectLanguage}
                              >
                                   <Option value="c">C</Option>
                                   <Option value="cpp">C++</Option>
                              </Select>
                              <br />
                              <br />
                              <AceEditor
                                   placeholder="Type your code here...."
                                   mode="c_cpp"
                                   theme="monokai"
                                   name="blah2"
                                   onChange={this.handleChange}
                                   fontSize={20}
                                   showPrintMargin={true}
                                   showGutter={true}
                                   highlightActiveLine={true}
                                   value={this.state.code}
                                   setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: false,
                                        enableSnippets: false,
                                        showLineNumbers: true,
                                        tabSize: 4
                                   }}
                                   width="100%"
                                   height="85vh"
                              />
                         </Col>
                         <Col sm={24} md={12} className="right-pane">
                              <h3>Enter your input</h3>
                              <TextArea
                                   rows={5}
                                   value={this.state.input}
                                   name="input"
                                   onChange={this.handleIOChange}
                              />
                              <button
                                   onClick={this.submitCode}
                                   disabled={this.state.btnState}
                              >
                                   Compile and Run
                              </button>
                              <h3>Output</h3>
                              <TextArea
                                   rows={5}
                                   value={this.state.output}
                                   name="output"
                                   onChange={this.handleIOChange}
                                   disabled={true}
                              />
                         </Col>
                    </Row>
               </div>
          );
     }
}

export default App;
