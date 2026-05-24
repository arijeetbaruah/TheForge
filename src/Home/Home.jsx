import React from 'react'

import {Button, Container, Form} from 'react-bootstrap';

import "./Home.css"
import Img from "./img.svg"

class Home extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            discordId: "",
            character: "",
            category: "",
            enchantment: "",
            providingBase: false,
        }

        this.OnSubmit = this.OnSubmit.bind(this);
    }

    OnSubmit() {

    }

    render() {
        return (
            <Container className={"page-wrap"}>
                <div className="parchment">
                    <div className="corner-ornament tl"><i className="fas fa-crown"></i></div>
                    <div className="corner-ornament tr"><i className="fas fa-crown"></i></div>
                    <div className="corner-ornament bl"><i className="fas fa-fire-flame-curved"></i></div>
                    <div className="corner-ornament br"><i className="fas fa-fire-flame-curved"></i></div>

                    <div className="text-center mb-2">
                        <img src={Img} alt="Logo"/>
                    </div>

                    <h1 className="parchment-title">The Forge</h1>
                    <p className="parchment-subtitle">Commission Request Scroll</p>

                    <div className="ink-divider">
                        <i className="fas fa-hammer"></i>
                        <i className="fas fa-shield-halved"></i>
                        <i className="fas fa-hammer fa-flip-horizontal"></i>
                    </div>

                    <Form className={"row"}>
                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formDiscordId">
                            <Form.Label className="ink-label"><i className="fas fa-hashtag fa-xs me-1"></i> Discord
                                ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter Discord ID"
                                          value={this.state.discordId}
                                          onChange={(e) => this.setState({discordId: e.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formcharacter">
                            <Form.Label className="ink-label"><i
                                className="fas fa-person fa-xs me-1"></i> Character</Form.Label>
                            <Form.Control type="text" placeholder="Enter Discord ID"
                                          value={this.state.character}
                                          onChange={(e) => this.setState({character: e.target.value})}/>
                        </Form.Group>

                        <hr className="section-rule"/>

                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formCategory">
                            <Form.Label className="ink-label"><i
                                className="fas fa-tag fa-xs me-1"></i> Category</Form.Label>
                            <div className="select-wrap">
                                <Form.Select
                                    value={this.state.category}
                                    onChange={(e) => this.setState({category: e.target.value})}>
                                    <option>Select Category</option>
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <Form.Group className="col-12" controlId="formEnchantment">
                            <Form.Label className="ink-label"><i
                                className="fas fa-sparkles fa-xs me-1"></i> Enchantment</Form.Label>
                            <div className="select-wrap">
                                <Form.Select
                                    value={this.state.enchantment}
                                    onChange={(e) => this.setState({enchantment: e.target.value})}>
                                    <option>Select Enchantment</option>
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <Form.Group className="col-12" controlId="formProvidingBase">
                            <div className="ink-check-wrap">
                                <Form.Check
                                    checked={this.state.providingBase}
                                    onChange={(e) => this.setState({providingBase: e.target.checked})}/>
                                <Form.Label className={"ink-check-label"}>
                                    <i className="fas fa-hand-holding fa-xs me-1"></i>
                                    I shall provide the base item myself
                                </Form.Label>
                            </div>
                        </Form.Group>

                        <div className="wax-seal-wrap">
                            <Button type="submit" className="wax-seal-btn" onClick={() => this.OnSubmit}>
                                <i className="fas fa-stamp"></i>
                                Submit
                            </Button>
                            <p className="seal-caption">Press your seal to commission</p>
                        </div>

                    </Form>
                </div>
            </Container>
        )
    }
}

export default Home;
