function escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

export function generateCharacterHtml(character: any, customFields: any) {
    const customFieldsHtml = customFields.map((field: any) => `
        <div style="margin-bottom: 8px;">
            <strong>${escapeHtml(field.fieldName)}:</strong> ${escapeHtml(field.fieldValue)}
        </div>
    `).join('')
    return `
    <html>
        <body style="font-family: sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">Character Card</h1>
            ${character.imageUrl ? `
                <img style="margin-bottom: 20px; max-width: 300px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" src="${escapeHtml(character.imageUrl)}" alt="Image Character" />
            ` : ''}
            <div class="default" style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                <strong>Имя: </strong> ${escapeHtml(character.name)} ${character.surname ? `${escapeHtml(character.surname)}<br>` : ''}
                ${character.description ? `<strong>Описание:</strong> ${escapeHtml(character.description)}<br>` : ''}
                ${character.age ? `<strong>Возраст:</strong> ${escapeHtml(character.age)}<br>` : ''}
                ${character.height ? `<strong>Рост:</strong> ${escapeHtml(character.height)}<br>` : ''}
                ${character.weight ? `<strong>Вес:</strong> ${escapeHtml(character.weight)}<br>` : ''}
                ${character.character ? `<strong>Характер:</strong> ${escapeHtml(character.character)}<br>` : ''}
            </div>
            
            ${customFields.length > 0 ? `
                <div class="custom-fields" style="border-top: 1px solid #ecf0f1; padding-top: 20px;">
                    <h3 style="color: #7f8c8d; margin-bottom: 15px;">Дополнительная информация</h3>
                    ${customFieldsHtml}
                </div>
            ` : ''}
        </body>
    </html>
    `
}
