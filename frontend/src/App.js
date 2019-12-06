import React from "react";
import "./App.css";
import AceEditor from "react-ace";
import { Select, Row, Col, Input } from "antd";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";

const { Option } = Select;
const { TextArea } = Input;

class App extends React.Component {
     constructor(props) {
          super(props);
          this.state = {
               lang: "c",
               code: `#include<bits/stdc++.h>
                           
using namespace std;
                                   
int main() {
               
     // Enter your code here
                                     
     return 0;
}`,
               input: "",
               output: ""
          };
          this.handleChange = value => {
               console.log(value);
          };
          this.selectLanguage = lang => {
               this.setState({
                    code: lang
               });
          };
          this.handleIOChange = e => {
               this.setState({
                    [e.target.name]: e.target.value
               });
          };
     }
     render() {
          return (
               <div className="App">
                    <Row>
                         <Col sm={24} md={12}>
                              <h1>Code Executor!</h1>
                              <Select
                                   defaultValue="C"
                                   style={{ width: 150 }}
                                   onChange={this.selectLanguage}
                              >
                                   <Option value="C">C</Option>
                                   <Option value="C++">C++</Option>
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
                              <button>Compile and Run</button>
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
