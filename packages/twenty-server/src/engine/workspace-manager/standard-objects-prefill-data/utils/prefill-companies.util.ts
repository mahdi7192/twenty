import { type EntityManager } from 'typeorm';
import { FieldActorSource } from 'twenty-shared/types';

export const AIRBNB_ID = 'c776ee49-f608-4a77-8cc8-6fe96ae1e43f';
export const ANTHROPIC_ID = 'f45ee421-8a3e-4aa5-a1cf-7207cc6754e1';
export const STRIPE_ID = '1f70157c-4ea5-4d81-bc49-e1401abfbb94';
export const FIGMA_ID = '9d5bcf43-7d38-4e88-82cb-d6d4ce638bf0';
export const NOTION_ID = '06290608-8bf0-4806-99ae-a715a6a93fad';

export const PREFILL_COMPANY_ROWS = [
  {
    id: AIRBNB_ID,
    name: 'دیجی‌کالا',
    domainNamePrimaryLinkUrl: 'digikala.com',
    addressAddressStreet1: 'خیابان گاندی، کوچه پنجم',
    addressAddressStreet2: null,
    addressAddressCity: 'تهران',
    addressAddressState: 'تهران',
    addressAddressPostcode: '15176',
    addressAddressCountry: 'ایران',
    position: 1,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: FieldActorSource.SYSTEM,
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
  },
  {
    id: ANTHROPIC_ID,
    name: 'اسنپ',
    domainNamePrimaryLinkUrl: 'snapp.ir',
    addressAddressStreet1: 'خیابان جردن، بلوار گلستان',
    addressAddressStreet2: null,
    addressAddressCity: 'تهران',
    addressAddressState: 'تهران',
    addressAddressPostcode: '19678',
    addressAddressCountry: 'ایران',
    position: 2,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: FieldActorSource.SYSTEM,
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
  },
  {
    id: STRIPE_ID,
    name: 'کافه‌بازار',
    domainNamePrimaryLinkUrl: 'cafebazaar.ir',
    addressAddressStreet1: 'سعادت‌آباد، میدان کاج',
    addressAddressStreet2: null,
    addressAddressCity: 'تهران',
    addressAddressState: 'تهران',
    addressAddressPostcode: '19986',
    addressAddressCountry: 'ایران',
    position: 3,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: FieldActorSource.SYSTEM,
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
  },
  {
    id: FIGMA_ID,
    name: 'تپسی',
    domainNamePrimaryLinkUrl: 'tapsi.ir',
    addressAddressStreet1: 'میدان ونک، خیابان خدامی',
    addressAddressStreet2: null,
    addressAddressCity: 'تهران',
    addressAddressState: 'تهران',
    addressAddressPostcode: '19945',
    addressAddressCountry: 'ایران',
    position: 4,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: FieldActorSource.SYSTEM,
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
  },
  {
    id: NOTION_ID,
    name: 'ابر آروان',
    domainNamePrimaryLinkUrl: 'arvancloud.ir',
    addressAddressStreet1: 'خیابان ولیعصر، نرسیده به توانیر',
    addressAddressStreet2: null,
    addressAddressCity: 'تهران',
    addressAddressState: 'تهران',
    addressAddressPostcode: '14348',
    addressAddressCountry: 'ایران',
    position: 5,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: FieldActorSource.SYSTEM,
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
  },
];

export const prefillCompanies = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.company`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'addressAddressStreet1',
      'addressAddressStreet2',
      'addressAddressCity',
      'addressAddressState',
      'addressAddressPostcode',
      'addressAddressCountry',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
    ])
    .orIgnore()
    .values(PREFILL_COMPANY_ROWS)
    .returning('*')
    .execute();
};
