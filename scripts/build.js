const fs = require('fs');
const path = require('path');

const readme = path.join(__dirname, '..', 'README.md');

const base_path = path.join(__dirname, '..', 'BASE.md');
const oops_path = path.join(__dirname, '..', 'OOPS.md');

let template = fs.readFileSync(base_path, 'utf-8');
let fallback = fs.readFileSync(oops_path, 'utf-8');

const sections = path.join(__dirname, '..', '_profile');

const messages = [];

template = template.replace(/<!-- INCLUDE:(\w+) -->/g, (match, name) => {
    let error = '';
    const file = path.join(sections, `${name}.md`);
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('<!-- STATUS:ready -->')) {
            const pattern = new RegExp(`<!-- DEFINE_SECTION:\s*${name}\s* -->([\s\S]*?)<!-- END_SECTION:\s*${name}\s* -->`, 'm');
            const match = content.match(pattern);
            messages.push({
                type: 'success',
                text: `✔️ '${name}' found.`
            });
            return match && match[1] ? match[1].trim() : content.trim();
        } else { error = 'not ready yet' }
    } else { error = 'not found' }
    messages.push({
        type: 'fail',
        text: `❌ '${name}' ${error}.`
    });
    return '';
});

const fails = messages.filter(message => message.type === 'fail');
if (messages.length == 0 || fails.length > 0) { template = fallback };
if (fails.length > 0) {
    messages.push({
        type: 'fail',
        text: `❌ Unable to build README.`
    })
    messages.sort((a, b) => (a.type == 'success' ? -1 : 1));
    const lines = messages.map(message => `${encodeURIComponent(message.text)}`).join(';');
    const height = messages.length * 25;
    const URL = `https://readme-typing-svg.demolab.com?font=Noto+Sans&size=14&duration=1&pause=1500&color=9198A1&vCenter=true&multiline=true&repeat=false&width=400&height=${height}&lines=${lines}`;
    template += (`
        <br>
        <div align="center">
            <img src="${URL}" alt="Typing SVG" />
        </div>
    `);
};

fs.writeFileSync(readme, template);
console.log('README.md has been updated!');