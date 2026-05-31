import React from 'react'
import _ from 'underscore'
import Select from 'react-select'
import { Container, Form } from 'react-bootstrap'

import SheetService from '../SheetService.js'
import Category from '../Entity/Category.js'
import CommissionReceipt from './CommissionReceipt.jsx'
import Embers from "./Ember.jsx";
import Img from './img.svg'

import s from '../styles/Home.module.scss'

class ForgeCommissionForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            discordId: '', character: '', category: null,
            baseItem: null, enchantment: null, quantity: 1,
            providingBase: false, submitted: false, taskId: '',
            allItems: [], allEnchantments: [],
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    async componentDidMount() {
        try {
            const response = await SheetService.fetchAll();
            this.setState({ allItems: response.items, allEnchantments: response.enchantments });
        } catch (e) { console.error('Failed to load forge data', e); }
    }

    async onSubmit(e) {
        e.preventDefault();
        const taskId = crypto.randomUUID();
        const { discordId, character, category, baseItem, enchantment, providingBase, quantity } = this.state;
        await SheetService.submitOrder({ taskId, discordId, character, category, baseItem, enchantment, providingBase, quantity });
        this.setState({ submitted: true, taskId });
    }

    handleCategoryChange(selected) {
        this.setState({ category: selected, baseItem: null, enchantment: null });
    }

    getFilteredItems() {
        const { category, allItems } = this.state;
        if (!category) return [];
        return _.chain(allItems)
            .filter(item => item.Category === category.value)
            .map((item, idx) => ({ value: idx, label: item.itemName }))
            .value();
    }

    getFilteredEnchantments() {
        const { category, allEnchantments } = this.state;
        if (!category) return [];
        return _.chain(allEnchantments)
            .filter(enc => enc.Category === category.value)
            .map((enc, idx) => ({ value: idx, label: enc.name }))
            .value();
    }

    render() {
        const { taskId, discordId, character, category, baseItem, quantity, enchantment, providingBase, submitted } = this.state;

        if (submitted) {
            return <CommissionReceipt data={{ taskId, discordId, character, category, baseItem, enchantment, providingBase, quantity }} onBack={() => this.setState({ submitted: false })} />;
        }

        const categoryOptions = [
            { value: Category.weapon,     label: 'Weapon'     },
            { value: Category.armor,      label: 'Armor'      },
            { value: Category.consumable, label: 'Consumable' },
            { value: Category.poison,     label: 'Poison'     },
        ];

        const selectStyles = {
            control:            b => ({ ...b, background: 'transparent', border: 'none', borderBottom: '1.5px solid #5a3e1b88', borderRadius: 0, boxShadow: 'none', fontFamily: "'Kalam', cursive", fontSize: '1rem' }),
            menu:               b => ({ ...b, background: '#f4e8c1', fontFamily: "'Kalam', cursive" }),
            option:             (b, s) => ({ ...b, background: s.isSelected ? '#5a3e1b' : s.isFocused ? '#e8d89a' : 'transparent', color: s.isSelected ? '#f4e8c1' : '#1a0f05' }),
            singleValue:        b => ({ ...b, color: '#1a0f05' }),
            placeholder:        b => ({ ...b, color: '#5a3e1b88' }),
            indicatorSeparator: () => ({ display: 'none' }),
        };

        return (
            <>
                <Embers/>
                <Container className={s.pageWrap}>
                    <div className={s.parchment}>
                        <div className={`${s.cornerOrnament} ${s.tl}`}><i className="fas fa-crown" /></div>
                        <div className={`${s.cornerOrnament} ${s.tr}`}><i className="fas fa-crown" /></div>
                        <div className={`${s.cornerOrnament} ${s.bl}`}><i className="fas fa-fire-flame-curved" /></div>
                        <div className={`${s.cornerOrnament} ${s.br}`}><i className="fas fa-fire-flame-curved" /></div>

                        <div className="text-center mb-2"><img src={Img} alt="Logo" /></div>
                        <h1 className={s.title}>The Forge</h1>
                        <p className={s.subtitle}>Commission Request Scroll</p>
                        <div className={s.inkDivider}>
                            <i className="fas fa-hammer" /><i className="fas fa-shield-halved" /><i className="fas fa-hammer fa-flip-horizontal" />
                        </div>

                        <Form className="row" onSubmit={this.onSubmit}>
                            <Form.Group className="mb-3 col-12 col-md-6" controlId="formDiscordId">
                                <Form.Label className={s.inkLabel}><i className="fas fa-hashtag fa-xs me-1" /> Discord ID</Form.Label>
                                <Form.Control type="text" placeholder="e.g. Aragorn#4291" value={discordId} onChange={e => this.setState({ discordId: e.target.value })} />
                            </Form.Group>

                            <Form.Group className="mb-3 col-12 col-md-6" controlId="formCharacter">
                                <Form.Label className={s.inkLabel}><i className="fas fa-person fa-xs me-1" /> Character</Form.Label>
                                <Form.Control type="text" placeholder="Your character's name" value={character} onChange={e => this.setState({ character: e.target.value })} />
                            </Form.Group>

                            <hr className={s.sectionRule} />

                            <Form.Group className="mb-3 col-12 col-md-6" controlId="formCategory">
                                <Form.Label className={s.inkLabel}><i className="fas fa-tag fa-xs me-1" /> Category</Form.Label>
                                <div className={s.selectWrap}>
                                    <Select value={category} onChange={sel => this.handleCategoryChange(sel)} options={categoryOptions} placeholder="— choose category —" styles={selectStyles} />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3 col-12 col-md-6" controlId="formBaseItem">
                                <Form.Label className={s.inkLabel}><i className="fas fa-scroll fa-xs me-1" /> Base Item</Form.Label>
                                <div className={s.selectWrap}>
                                    <Select value={baseItem} onChange={sel => this.setState({ baseItem: sel })} options={this.getFilteredItems()} placeholder="— none selected —" isDisabled={!category} styles={selectStyles} />
                                </div>
                            </Form.Group>

                            <Form.Group className="col-12" controlId="formEnchantment">
                                <Form.Label className={s.inkLabel}><i className="fas fa-wand-sparkles fa-xs me-1" /> Enchantment</Form.Label>
                                <div className={s.selectWrap}>
                                    <Select value={enchantment} onChange={sel => this.setState({ enchantment: sel })} options={this.getFilteredEnchantments()} placeholder="— no enchantment —" isDisabled={!category} styles={selectStyles} />
                                </div>
                            </Form.Group>

                            <Form.Group className="col-12 mt-3" controlId="formQuantity">
                                <Form.Label className={s.inkLabel}><i className="fas fa-hashtag fa-xs me-1" /> Quantity</Form.Label>
                                <Form.Control type="number" value={quantity} onChange={e => this.setState({ quantity: e.target.value })} />
                            </Form.Group>

                            <Form.Group className="col-12 mt-3" controlId="formProvidingBase">
                                <div className={s.inkCheckWrap}>
                                    <Form.Check checked={providingBase} onChange={e => this.setState({ providingBase: e.target.checked })} />
                                    <Form.Label className={s.inkCheckLabel}><i className="fas fa-hand-holding fa-xs me-1" /> I shall provide the base item myself</Form.Label>
                                </div>
                            </Form.Group>

                            <div className={s.waxSealWrap}>
                                <button type="submit" className={s.waxSealBtn}><i className="fas fa-stamp" />Submit</button>
                                <p className={s.sealCaption}>Press your seal to commission</p>
                            </div>
                        </Form>

                        <div className={s.taskIdNote}><i className="fas fa-feather fa-xs" /> A unique scroll number shall be assigned upon submission</div>
                        <p className={s.footer}>All commissions are subject to the laws of The Forge &amp; its masters</p>
                    </div>
                </Container>
            </>
        );
    }
}

export default ForgeCommissionForm;
