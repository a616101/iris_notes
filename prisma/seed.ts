import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始載入種子數據...');

  // 清空現有數據（開發環境）
  if (process.env.NODE_ENV === 'development') {
    await prisma.developmentLog.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }

  // 建立預設使用者
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });
  console.log('✅ 建立使用者:', user.username);

  // 建立產業類別
  const categories = ['製造', '醫療', '服務', '政府', '學校', '醫院', '其他'];
  const createdCategories: Array<{ id: number; name: string }> = await Promise.all(
    categories.map((name) =>
      prisma.category.create({
        data: { name },
      })
    )
  );
  console.log('✅ 建立產業類別:', categories.length, '個');

  // 建立範例客戶
  const schoolCategory = createdCategories.find((c) => c.name === '學校');
  const manufactureCategory = createdCategories.find((c) => c.name === '製造');
  const serviceCategory = createdCategories.find((c) => c.name === '服務');

  if (schoolCategory && manufactureCategory && serviceCategory) {
    // 客戶 1: 動感幼稚園
    const customer1 = await prisma.customer.create({
      data: {
        company: '動感幼稚園',
        userId: user.id,
        categoryId: schoolCategory.id,
        phone: '02-1234-5678',
        address: '春日部市雙葉町 1-1',
        level: 'L5',
        otherSales: 'A',
        nextTime: new Date('2023-12-15'),
        contacts: {
          create: [
            {
              name: '吉永老師',
              title: '主任',
            },
          ],
        },
        logs: {
          create: [
            {
              logDate: new Date('2023-11-03'),
              method: '電話',
              notes: '承辦不在位子上，請下午再撥。',
            },
            {
              logDate: new Date('2023-11-23'),
              method: '電話',
              notes: '承辦說可先行寄發相關 Mail。',
            },
            {
              logDate: new Date('2023-12-02'),
              method: 'LINE',
              notes: '約訪成功,約下週三見面。',
            },
            {
              logDate: new Date('2023-12-06'),
              method: '實體',
              notes: '初次拜訪，現場反應熱烈。',
            },
          ],
        },
      },
    });

    // 客戶 2: 妮妮兔子實業
    const customer2 = await prisma.customer.create({
      data: {
        company: '妮妮兔子實業',
        userId: user.id,
        categoryId: manufactureCategory.id,
        phone: '03-987-6543',
        address: '春日部市三葉町 5-2',
        level: 'L1',
        otherSales: 'S',
        contacts: {
          create: [
            {
              name: '妮妮媽',
              title: '總務',
            },
          ],
        },
        logs: {
          create: [
            {
              logDate: new Date('2023-11-01'),
              method: '電話',
              notes: '電話無人接聽。',
            },
          ],
        },
      },
    });

    // 客戶 3: 黑磯私人保全
    const customer3 = await prisma.customer.create({
      data: {
        company: '黑磯私人保全',
        userId: user.id,
        categoryId: serviceCategory.id,
        phone: '02-5555-6666',
        address: '春日部市大原町 9-9',
        level: 'L3',
        contacts: {
          create: [
            {
              name: '黑磯',
              title: '保鏢',
            },
          ],
        },
        logs: {
          create: [
            {
              logDate: new Date('2023-12-10'),
              method: '實體',
              notes: '大小姐不感興趣，但黑磯先生態度客氣。',
            },
          ],
        },
        nextTime: new Date('2024-01-05'),
      },
    });

    console.log('✅ 建立範例客戶:', 3, '家');
    console.log('  -', customer1.company);
    console.log('  -', customer2.company);
    console.log('  -', customer3.company);
  }

  console.log('🎉 種子數據載入完成！');
  console.log('');
  console.log('📝 預設登入資訊:');
  console.log('   帳號: admin');
  console.log('   密碼: admin123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 種子數據載入失敗:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
