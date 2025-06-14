/**
 * This T&C component is meant to be able to put in any React websites for DO
 * So I'm not using any 3-rd party libs out of React
 * Sample Usage (as I first used in WCO Website):
 * <div className='text-sm text-right'>
 *    请仔细阅读我们的 <DoTermsAndConditions defaultLang='en'/>
 * </div>
*/
// src/<components folder>/DoTermsAndConditions.jsx

import React, { useState } from 'react';

const DoTermsAndConditions = ({ defaultLang = 'zh' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState(defaultLang);

    const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');
    const toggleModal = () => setIsOpen(!isOpen);

        const zhContent = `任何使用出国梦集团（Dream Overseas Group Pty Ltd - ABN: 531 191 108 60）网站的用户均应仔细阅读本条例：
- 服务协议
第1条：服务条款的接受
1、本服务条款所称的服务商、合作方是指完全同意所有条款并使用出国梦集团各项软件服务（以下称为“本服务”）的出国服务商、合作方及其他使用出国梦集团网络运营、操作平台的人员（以下称为“服务商、合作方”）。通过开通服务应用软件，服务商、合作方便表明其接受并同意受本服务条款及其他声明的约束；同时，服务商、合作方保证其提交的信息真实、合法、有效、准确、及时和完整。
2、本服务条款以《出国梦集团用户服务协议》为基础，服务商、合作方接受本服务条款，默认表示接受《出国梦集团用户服务协议》及其他全部声明等的相关条款。

第2条：服务条款的变更和修改
1、出国梦集团提供的软件服务包括但不限于服务商、合作方委托、合作开单、项目分享、运营管理、操作等服务功能，服务商、合作方在开通这些服务功能时，表明其已经了解相关产品的功能以及使用规则，并愿意接受。
2、出国梦集团有权利根据软件的使用情况，进行功能的新增、修改和删减。

第3条：服务说明
1、出国梦集团通过自己的计算机系统经由国际互联网向服务商、合作方提供营销软件服务。除非另有明确规定，增强或改变目前服务的任何新功能，包括新产品，均无条件地适用本服务条款。除非本条款中另有规定，否则出国梦集团对网络服务不承担任何责任，即服务商、合作方对网络服务的使用承担风险。出国梦集团不保证服务一定会满足服务商、合作方的使用要求，也不保证服务不会受中断，对服务的及时性、安全性、准确性也不作担保。
2、出国梦集团不对服务商、合作方在使用过程中，与第三方产生的纠纷负责。
3、在以下情况下，出国梦集团有权删除在使用本服务过程中产生相关信息内容，乃至终止为服务商、合作方提供本服务：
    3.1 服务商、合作方违反了《出国梦集团用户服务协议》中的相关条款。
    3.2 应服务商、合作方要求。
    3.3服务商、合作方违反了软件服务的相关规则。

第4条：有偿服务说明
服务商、合作方在支付软件的服务费用时，必仔细确认自己的账号并仔细选择相关操作选项。若因为服务商、合作方自身输入账号错误、操作不当或不了解充值计费方式等因素造成充错帐号、错选充值种类等情形而损害自身权益的，出国梦集团将不会作任何补偿或赔偿。若服务商、合作方以非法的方式，或使用非出国梦集团所指定的充值方式进行充值，出国梦集团不保证该充值顺利或者正确完成。若因此造成咨询师权益受损时，出国梦集团不会作任何补偿或赔偿，出国梦集团同时保留随时终止该服务商、合作方使用本服务的权利。在使用过程中，若因服务商、合作方自身原因需要终止本服务，则不退还之前为使用本服务而支付的费用。若因出国梦集团的原因，则根据服务商、合作方的使用情况，扣除已消费的部分费用，退还剩余费用。

第5条：法律的适用和管辖
本服务条款的生效、履行、解释及争议的解决均适用中华人民共和国法律。如果本服务条款中某项条款因与中华人民共和国现行法律相抵触而导致无效，将不影响其他部分的效力。本服务协议和出国梦集团的其他服务条款构成完整的协议。同时服务商、合作方也同意遵守以下两项服务管理规定和办法：《互联网电子公告服务管理规定》和《互联网信息服务管理办法》。 

第6条：冲突选择
本服务条款是出国梦集团与服务商、合作方之间的法律关系的重要文件，出国梦集团或者服务商、合作方的任何书面或者口头意思表示与本服务条款不一致的，均应当以本服务条款为准，除非本服务条款被出国梦集团声明作废或者被新版本代替。

第7条：条款的生效
除非另行通知，本服务条款自2013年6月8日起生效。

- 免责声明
1.在出国梦集团网站发布、转载的资料、图片均由网站用户提供，其真实性、准确性和合法性由信息发布人负责,发布人兹此确认并同意承担全部责任。
2.出国梦集团网站仅仅是互联网网络运营平台，不为发布人提供任何保证，并不承担任何法律责任。
3.出国梦集团网站上所发表的文章及图片等资料，如果侵犯了第三方的知识产权或其他权利，责任由作者或转载者本人承担，本网站对此不承担责任。
4.因黑客攻击、通讯线路等任何技术原因导致用户不能正常使用出国梦集团网站，本网站不承担任何法律责任。
5.凡以任何方式登陆本网站或直接、间接使用本网站资料者，视为已经阅读并理解、知悉全部要求和规则，自愿接受本网站声明等的约束。
6.本声明未涉及的问题参见国家有关法律法规，当本声明与国家法律法规冲突时，以国家法律法规为准。
7.本网站之声明以及其修改权、更新权及最终解释权均属出国梦集团网站所有。

- 版权声明 
本网站由出国梦集团集团（Dream Overseas Group Pty Ltd - ABN: 531 191 108 60）提供技术和内容支持。为了保护权利人的合法权益，依法发表如下版权声明：
出国梦集团网站之网页内容，包括但不限于文字、商标、图表图片、设计、网页上的照片、产生网页的程式码及其他构成这些网页内容的载体、文件及设计等均由出国梦集团集团完成，以上作品的著作权利的属于该公司。
未经权利人许可，任何个人或组织不得对出国梦集团网站内容进行复制、转载、修改、抄袭、剽窃、贩卖、展示、公开、散播等或是将其用于任何商业或非商业目的。
出国梦集团网站用户发表、转载的所有文章及其它资料（如示例代码、图片等）的版权中署名权归原作者所有，已经上传出国梦集团网站，即视为同意出国梦集团无偿使用并同意出国梦集团做适合网站需要的修改、删减。出国梦集团用户同时保证上传、转载、发表的内容不侵犯他人版权，本网站保有使用权。其他任何单位或个人转载出国梦集团网站发表的文章的，需经原作者同意，并注明转载自出国梦集团网站。本网站保留追究非法转载者法律责任的权利。
`;

    const enContent = `All users of the Dream Overseas Group Pty Ltd (ABN: 531 191 108 60) websites are advised to read these terms and conditions carefully:

I. Service Agreement

Article 1: Acceptance of Terms of Service
“Service Providers” and “Partners” as referred to in these Terms of Service are individuals or entities who fully accept all terms herein and utilize various software services provided by Dream Overseas Group (hereinafter referred to as “Services”). By activating service-related applications, service providers and partners explicitly indicate their acceptance of and agreement to be bound by these Terms of Service and all related declarations. They also guarantee that all information submitted is truthful, lawful, valid, accurate, timely, and complete.
These Terms of Service are based on the “Dream Overseas Group User Service Agreement.” Acceptance of these Terms implies simultaneous acceptance of the aforementioned User Agreement and all related declarations.

Article 2: Modification of Terms
The software services provided by Dream Overseas Group Group include, but are not limited to: commission-based cooperation, project sharing, operational management, and platform-based functionalities. By enabling any of these features, service providers and partners acknowledge their understanding and acceptance of the related product functions and usage guidelines.
Dream Overseas Group reserves the right to add, modify, or remove features based on software usage requirements.

Article 3: Service Description
Dream Overseas Group provides its services via the Internet through its own computer systems, offering marketing software tools to service providers and partners. Unless explicitly stated otherwise, any enhancements or modifications to existing features—including new products—shall be subject to these Terms. Except where otherwise specified, Dream Overseas Group is not responsible for the availability of network services, and the use of such services is at the user's own risk. Dream Overseas Group does not guarantee that services will meet user expectations or remain uninterrupted, timely, secure, or error-free.
Dream Overseas Group is not responsible for any disputes arising between users and third parties during service use.
Dream Overseas Group reserves the right to delete relevant content or terminate services under the following circumstances:
- 3.1 Violation of the “Dream Overseas Group User Service Agreement” by the service provider or partner;
- 3.2 Upon request from the service provider or partner;
- 3.3 Violation of related software service rules by the service provider or partner.

Article 4: Paid Services
Before paying for software services, service providers and partners must carefully verify their account details and confirm their selected options. Dream Overseas Group shall not be held responsible for losses caused by incorrect account entry, misuse of the platform, or misunderstandings of the billing system. If a service provider or partner makes a payment using unauthorized or illegal means, Dream Overseas Group does not guarantee that the transaction will be successful or accurate. Dream Overseas Group will not offer compensation for any losses incurred by consultants due to such actions and reserves the right to terminate service access at any time.
If a user terminates services for personal reasons, any fees paid will not be refunded. In cases where termination is due to Dream Overseas Group, fees will be refunded proportionally, deducting any portion already used.

Article 5: Governing Law and Jurisdiction
These Terms of Service shall be governed by and interpreted in accordance with the laws. If any provision of these Terms is deemed invalid due to conflict with applicable laws, the remaining provisions shall remain in full effect. These Terms, along with other service agreements of Dream Overseas Group, constitute a complete and binding legal agreement. Users also agree to comply with the “Administrative Regulations on Internet Electronic Bulletin Services” and the “Administrative Measures for Internet Information Services.”

Article 6: Conflict Resolution
These Terms serve as a crucial legal agreement between Dream Overseas Group and its service providers and partners. In the event of any conflict between these Terms and any other written or oral statements, these Terms shall prevail unless explicitly invalidated or replaced by a newer version issued by Dream Overseas Group.

Article 7: Effective Date
Unless otherwise stated, these Terms of Service shall take effect as of June 8, 2013.

II. Disclaimer
All materials and images published or reposted on the Dream Overseas Group website are provided by users. The authenticity, accuracy, and legality of such content are the sole responsibility of the contributor, who acknowledges full liability.
Dream Overseas Group serves solely as an online platform and does not provide any guarantees or assume any legal responsibility for published content.
Dream Overseas Group shall not be held liable for any infringement of intellectual property or other rights caused by articles or images posted by users; such responsibility lies solely with the original author or distributor.
Dream Overseas Group is not responsible for service interruptions caused by hacking, communication failures, or other technical issues.
Anyone accessing or using the website’s materials—directly or indirectly—is deemed to have read, understood, and agreed to be bound by the website’s declarations and rules.
For matters not covered in this disclaimer, relevant national laws and regulations shall apply. In case of conflict, the applicable laws and regulations shall prevail.
Dream Overseas Group reserves the right to interpret, update, and amend this disclaimer.

III. Copyright Notice
This website is technically and content-wise supported by Dream Overseas Group Pty Ltd (ABN: 531 191 108 60) To protect the legitimate rights of copyright holders, the following statement is made:
All content on the Dream Overseas Group website—including but not limited to text, trademarks, charts, images, designs, photos, source code, files, and design elements—is produced by Dream Overseas Group Pty. Ltd., which owns the corresponding intellectual property rights.
No individual or organization may copy, reproduce, modify, plagiarize, sell, display, or publicly disseminate any content without prior written consent from the rights holder.
All user-submitted content—including articles, sample code, and images—remains attributed to the original author. Upon uploading to Dream Overseas Group, users agree to grant Dream Overseas Group a royalty-free license to use, edit, or modify such content for platform purposes. Users also guarantee that their content does not infringe upon any third-party copyrights.
Any third party wishing to reprint content from Dream Overseas Group must obtain permission from the original author and clearly cite Dream Overseas Group as the source. Unauthorized reproduction may result in legal liability.
`;

    return (
        <span>
            <button type="button" style={styles.linkButton} onClick={toggleModal}>{lang === 'zh' ? "服务条款" : "Terms & Conditions"}</button>
            {isOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.header}>
                            <button type="button" style={styles.langSwitch} onClick={toggleLang}>{lang === 'zh' ? 'English' : '中文'}</button>
                            <b>{lang === 'zh' ? "服务条款" : "Terms & Conditions"}</b>
                            <button type="button" style={styles.closeBtn} onClick={toggleModal}>×</button>
                        </div>
                        <div style={styles.content}>{lang === 'zh' ? zhContent : enContent}</div>
                        <button type="button" style={styles.confirmBtn} onClick={toggleModal}>{lang === 'zh' ? "确定" : "Comfirm"}</button>
                    </div>
                </div>
            )}
        </span>
    );
};

const styles = {
    linkButton: {
        color: 'blue',
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: 'inherit'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        textAlign: 'left',
        display: 'block',
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        borderRadius: '8px',
        padding: '1rem',
        flexDirection: 'column',
        position: 'relative'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#888'
    },
    langSwitch: {
        background: 'none',
        border: '1px solid #888',
        borderRadius: '4px',
        padding: '0.2rem 0.5rem',
        fontSize: '0.9rem',
        cursor: 'pointer'
    },
    content: {
        flexGrow: 1,
        whiteSpace: 'pre-wrap',
        marginBottom: '1rem',
        fontSize: '0.95rem',
        maxHeight: '60vh',
        overflowY: 'auto',
        color: '#333'
    },
    confirmBtn: {
        width: '100%',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer'
    }
};

export default DoTermsAndConditions;
