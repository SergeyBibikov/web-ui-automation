import { expect, Page, test } from '@playwright/test';
import * as assert from 'assert';

import * as compare from "../../helpers/comparison";
import { Header } from '../../pageObjects/header';
import { Footer } from '../../pageObjects/footer';
import { Homepage } from '../../pageObjects/homepage';

test.describe('Top bar links', () => {

    test("Links list", async ({ page }) => {
        const expectedLinks = [
            'Ozon для бизнеса',
            'Мобильное приложение',
            'Подарочные сертификаты',
            'Продавайте на Ozon',
            'Помощь',
            'Реферальная программа',
        ];

        await Homepage.open(page);
        const presentLinks = await Homepage.getTopBarLinks(page);
        const diff = compare.getMissingArrayElements(presentLinks, expectedLinks);
        if (diff) {
            assert.fail(`The following links are missing: ${diff}`);
        }
    });

    test.skip('Ozon for business', async ({ page }) => {
        await Homepage.open(page);
        await Homepage.clickTopBarLink(page, 'Ozon для бизнеса');
        await expect(page.locator('body')).toContainText('Для компаний любого масштаба');
    });

    test.describe('Mobile app', () => {
        test('Navigate from homepage', async ({ page }) => {
            await Homepage.open(page);
            await Homepage.clickTopBarLink(page, 'Мобильное приложение');
            await expect(page.locator('#apps')).toContainText('OZON ещё лучше в приложении');
        });
    })

    test.skip('Gift certificate', async ({ page }) => {
        await Homepage.open(page);
        await Homepage.clickTopBarLink(page, 'Подарочные сертификаты');
        await expect(page.locator('//div[@data-widget="webProductHeading"]')).toContainText('Электронный подарочный сертификат');
    });

    test('Help on hover', async ({ page }) => {
        await Homepage.open(page);
        await page.hover('text=Помощь');
        const helpPopup = page.locator('//*[text()="Статус заказа"]/../../..');
        await expect(helpPopup.locator('a')).toHaveCount(8);
    });

});

//TODO: use function getElementColor
test('Promo code', async ({ page }) => {
    const expectedColor = 'rgb(249, 17, 85)';
    const getBorderColor = async () => {
        return await page.evaluate(() => {
            const di = document.querySelector("[data-widget='promoNavigation']>div>div");
            if (di) {
                return document.defaultView?.getComputedStyle(di).borderColor || "";
            } else {
                return "Not found"
            }
        });
    }

    await Homepage.open(page);
    const promo = page.locator('[data-widget="promoNavigation"]');
    await expect(promo).toContainText('Есть промокод?');
    const promoInput = promo.locator('input[type="text"]');
    await expect(promoInput).toHaveCount(1);
    const promoButton = promo.locator('button');
    await expect(promoButton).toHaveCount(1);
    await promoButton.click();
    await page.waitForTimeout(1000);
    const color = await getBorderColor();
    assert.equal(color, expectedColor);
    await promoInput.fill('44');
    await promoButton.click();
    await expect(page.locator('body')).toContainText('Вы не авторизованы');
});

test.describe('Sign in from header', () => {
    test('Sign in button on hover. Pop-up', async ({ page }) => {
        await Homepage.open(page);
        await page.hover(Header.SIGN_IN);
        await page.waitForSelector('//button[contains(. , "Войти или зарегистрироваться")]');
        await page.waitForSelector('//button[contains(. , "Личный кабинет")]');
    });
});

test.describe('Header links', () => {
    const checkPageLoad = async (p: Page, link: string, textToExpect: string) => {
        await Homepage.open(p);
        await Header.goToNavbarLink(p, link);
        await expect(p.locator('body')).toContainText(textToExpect);
    }
    //TODO:add all links tests
    //TODO: return travel link check when the text is stable
    test('Links list', async ({ page }) => {
        const expectedLinks = [
            'TOP Fashion', 'Premium',
            'Ozon fresh',
            'Ozon Карта', 'Рассрочка',
            'Акции',
            'Бренды',
            'Express',
            'Электроника',
            'Одежда и обувь', 'Детские товары',
            'Дом и сад'
        ]

        await Homepage.open(page);
        const presentLinks = await Header.getNavBarLinks(page);
        const diff = compare.getMissingArrayElements(presentLinks, expectedLinks);
        if (diff) {
            assert.fail(`The following links are missing: ${diff}`);
        }
    });
    test.skip('TOP Fashion', async ({ page }) => {
        await checkPageLoad(page, 'TOP Fashion', 'TOP Fashion');
    });
    test.skip('LIVE', async ({ page }) => {
        await Homepage.open(page);
        await Header.goToNavbarLink(page, 'LIVE');
        await expect(page.locator('[data-widget="webTopStreams"]')).toHaveCount(1);
    });
    test.skip('Акции', async ({ page }) => {
        await checkPageLoad(
            page,
            'Акции',
            'Выгодные предложения'
        );
    });
    test.skip('Бренды', async ({ page }) => {
        await checkPageLoad(
            page,
            'Бренды',
            'Популярные бренды'
        );
    });
    test.skip('Магазины', async ({ page }) => {
        await checkPageLoad(
            page,
            'Магазины',
            'Все магазины'
        );
    });
    test.skip('Электроника', async ({ page }) => {
        await checkPageLoad(
            page,
            'Электроника',
            'Бытовая техника'
        );
    });
    test.skip('Одежда и обувь', async ({ page }) => {
        await checkPageLoad(
            page,
            'Одежда и обувь',
            'Женская одежда, обувь и аксессуары'
        );
    });
    test.skip('Детские товары', async ({ page }) => {
        await checkPageLoad(
            page,
            'Детские товары',
            'Игрушки и игры'
        );
    });
    test.skip('Дом и сад', async ({ page }) => {
        await checkPageLoad(
            page,
            'Дом и сад',
            'Товары для праздников'
        );
    });
})

test('Catalogue. Filters change on hover', async ({ page }) => {
    await Homepage.open(page);
    await Header.openCatalogue(page);
    await page.hover(Header.CATALOGUE_CATEGORIES + '//a[span[text()="Обувь"]]');
    await expect(page.locator(Header.CATALOGUE_FILTERS)).toContainText('Босоножки');
    await page.hover(Header.CATALOGUE_CATEGORIES + '//a[span[text()="Электроника"]]');
    await expect(page.locator(Header.CATALOGUE_FILTERS)).toContainText('Моноблоки');
});


test.describe('Footer', () => {
    test('Accessibility version button', async ({ page }) => {
        await Homepage.open(page);
        await expect(page.locator(Footer.locators.VER_FOR_VIS_IMPARED)).toHaveCount(1);
    });

    test('Misc info links', async ({ page }) => {
        await Homepage.open(page);
        const infoLinksSection = page.locator(Footer.locators.INFO_LINKS_SECTION);
        await expect(infoLinksSection.locator('xpath=/div')).toHaveCount(5);
        await expect(infoLinksSection.locator('xpath=/div[1]/span')).toHaveText('Зарабатывайте с Ozon');
        await expect(infoLinksSection.locator('xpath=/div[2]/span')).toHaveText('О компании');
        await expect(infoLinksSection.locator('xpath=/div[3]/span')).toHaveText('Помощь');
        await expect(infoLinksSection.locator('xpath=/div[4]/span')).toHaveText('Ozon для бизнеса');
    });

    test('Ozon ecosystem links', async ({ page }) => {
        await Homepage.open(page);
        const ecoSection = page.locator(Footer.locators.ECOSYSTEM_SECTION);
        await expect(ecoSection.locator('a')).toHaveCount(5);
        await expect(ecoSection).toContainText('Интернет-магазин');
        await expect(ecoSection).toContainText('Работа в Ozon');
        await expect(ecoSection).toContainText('Авиабилеты');
        await expect(ecoSection).toContainText('Бесплатные IT курсы');
        await expect(ecoSection).toContainText('Электронные книги');
    });
});
