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

const DoTermsAndConditions = ({ defaultLang }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState(defaultLang);

    const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');
    const toggleModal = () => setIsOpen(!isOpen);

        const zhContent = `任何使用出国梦集团（Dream Overseas Group Pty Ltd - ABN: 531 191 108 60）旗下的核销券系统（以下简称“DO Coupon System”）的用户均应仔细阅读本条例：

- 服务协议
第1条：服务条款的接受  
1、本服务条款所称的服务商、合作方是指完全同意所有条款并使用 DO Coupon System 提供服务的出国服务商、合作方及其他使用出国梦集团相关网络平台的人员。通过开通本系统的相关功能，服务商、合作方便表明其接受并同意受本服务条款及出国梦集团其他声明的约束。  
2、本服务条款以《出国梦集团用户服务协议》为基础，接受本条款即视为同时接受其所有附属声明及协议内容。

第2条：服务条款的变更和修改  
1、DO Coupon System 所提供的软件服务包括但不限于券码管理、核销记录、数据追踪、用户权限管理等。开通服务即视为已了解其功能与使用规则，并愿意接受。  
2、出国梦集团有权根据系统运行情况对功能进行新增、修改或删减，且无需事先通知。

第3条：服务说明  
1、DO Coupon System 通过出国梦集团的计算机系统经由互联网向服务商、合作方提供服务。所有新增或变更的功能均自动适用于本服务条款。除非另有规定，服务商、合作方需自行承担使用本系统所带来的风险。出国梦集团不对服务的连续性、及时性、安全性或准确性作任何保证。  
2、出国梦集团不承担服务商、合作方在使用系统过程中与第三方产生的任何纠纷或损失责任。  
3、以下情况下，出国梦集团有权删除用户信息或终止服务：
    - 3.1 违反用户服务协议；
    - 3.2 应服务商、合作方申请；
    - 3.3 违反系统管理规定。

第4条：有偿服务说明  
若本系统涉及收费项目，服务商、合作方需自行核对信息并确认付款操作，因自身失误造成的损失，出国梦集团概不负责。使用非法或非官方支付方式的，出国梦集团不保证其充值成功且不予补偿；并保留终止服务权利。用户主动终止服务的，已付费用不予退还；若由出国梦集团原因终止服务，将退还剩余未使用费用。

第5条：数据使用和隐私政策  
1、DO Coupon System 所收集的数据仅用于核销服务相关的身份验证、记录管理与行为追踪。  
2、出国梦集团将严格遵守澳大利亚《隐私法》（Privacy Act 1988）及适用数据保护法规，合理保存、使用并保护用户的个人信息和交易数据。  
3、未经授权，不会将用户数据用于第三方营销或转售；如需进行数据分析或服务优化，所有数据将以匿名或聚合形式处理。  
4、用户有权申请其个人数据的访问、更正或删除。  
5、如需更多信息，请查阅《出国梦集团隐私政策》。

第6条：法律适用与争议解决  
本条款适用中华人民共和国法律。如部分内容与现行法律冲突，则无效部分不影响其他内容的有效性。服务商、合作方还须遵守《互联网电子公告服务管理规定》和《互联网信息服务管理办法》。

第7条：冲突条款优先级  
本服务条款优先于任何书面或口头形式的说明，除非有正式声明或新版条款代替。

第8条：生效日期  
除非另行通知，本服务条款自2025年6月4日起生效，适用于 DO Coupon System 及出国梦集团旗下相关系统。

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

    const enContent = `All users of the Dream Overseas Group Pty Ltd (ABN: 531 191 108 60) coupon system (hereinafter referred to as the "DO Coupon System") are advised to read these Terms and Conditions carefully:

I. Service Agreement

Article 1: Acceptance of Terms  
"Service Providers" and "Partners" refer to entities who fully accept the terms herein and utilize DO Coupon System services. By enabling system functions, they agree to be bound by this agreement and related declarations of Dream Overseas Group.  
These Terms are based on the “Dream Overseas Group User Service Agreement.” Acceptance implies consent to all associated policies and declarations.

Article 2: Modifications  
Services include but are not limited to coupon management, redemption tracking, data reporting, and user access control. Use of these services confirms understanding and acceptance of the features.  
Dream Overseas Group reserves the right to update, enhance, or discontinue features at its sole discretion.

Article 3: Service Description  
DO Coupon System is delivered via the internet using Dream Overseas Group’s infrastructure. Unless otherwise stated, all changes and additions are subject to this agreement. Usage is at the user’s own risk, and service continuity, accuracy, or security is not guaranteed.  
Dream Overseas Group is not liable for disputes with third parties arising during system use.  
The Group reserves the right to remove user data or terminate service in the following cases:
- 3.1 Violation of the Dream Overseas Group User Service Agreement;
- 3.2 At the request of the service provider or partner;
- 3.3 Breach of platform rules.

Article 4: Paid Services  
Users must verify account information before paying. Losses from errors or misuse will not be compensated. Illegal or unauthorized payment methods are unsupported, and Dream Overseas Group reserves the right to terminate service access. Refunds will not be given for voluntary terminations. In the event of a service issue attributable to Dream Overseas Group, partial refunds may be issued.

Article 5: Data Usage and Privacy Policy  
1. Data collected through DO Coupon System is used solely for identity verification, redemption tracking, and operational optimization.  
2. Dream Overseas Group complies with the **Privacy Act 1988 (Cth)** and applicable data protection laws.  
3. No personal data will be sold or used for third-party marketing without consent. Aggregate or anonymized data may be used for service improvement.  
4. Users have the right to access, correct, or delete their personal data.  
5. For more information, refer to the “Dream Overseas Group Privacy Policy.”

Article 6: Legal Jurisdiction  
These Terms shall be governed by PRC law. If any clause conflicts with current law, only that clause shall be void. Users must also comply with the "Administrative Regulations on Internet Electronic Bulletin Services" and the "Administrative Measures for Internet Information Services."

Article 7: Conflict Priority  
These Terms override any verbal or written inconsistencies unless explicitly replaced by a new version or declaration from Dream Overseas Group.

Article 8: Effective Date  
These Terms shall take effect from June 4, 2025, and are applicable to the DO Coupon System and associated platforms.

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
