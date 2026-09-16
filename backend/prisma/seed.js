const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    const adminRole = await prisma.role.upsert({
        where: {
            name: "ADMIN",
        },
        update: {},
        create: {
            name: "ADMIN",
        },
    });

    const wargaRole = await prisma.role.upsert({
        where: {
            name: "WARGA",
        },
        update: {},
        create: {
            name: "WARGA",
        },
    });

    const permissionNames = [
        "dashboard.view",
        "dashboard.user.view",
        "users.view",
        "users.create",
        "users.update",
        "users.delete",
        "categories.view",
        "categories.create",
        "categories.update",
        "categories.delete",
        "items.view",
        "items.create",
        "items.update",
        "items.delete",
        "loans.view",
        "loans.create",
        "loans.approve",
        "loans.reject",
        "loans.borrow",
        "loans.return",
        "loans.cancel",
    ];

    const permissions = [];

    for (const permissionName of permissionNames) {
        const permission = await prisma.permission.upsert({
            where: {
                name: permissionName,
            },
            update: {},
            create: {
                name: permissionName,
                description: `Permission untuk ${permissionName}`,
            },
        });

        permissions.push(permission);
    }

    for (const permission of permissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
    }

    const wargaPermissionNames = [
        "dashboard.user.view",
        "categories.view",
        "items.view",
        "loans.view",
        "loans.create",
        "loans.cancel",
    ];

    for (const permissionName of wargaPermissionNames) {
        const permission = permissions.find(
            (item) => item.name === permissionName
        );

        if (!permission) {
            continue;
        }

        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: wargaRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: wargaRole.id,
                permissionId: permission.id,
            },
        });
    }

    const adminPasswordHash = await argon2.hash("Admin12345!", {
        type: argon2.argon2id,
    });

    const wargaPasswordHash = await argon2.hash("Warga12345!", {
        type: argon2.argon2id,
    });

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@rtinventory.test",
        },
        update: {
            roleId: adminRole.id,
        },
        create: {
            name: "Administrator RT",
            email: "admin@rtinventory.test",
            passwordHash: adminPasswordHash,
            phone: "081234567890",
            address: "Sekretariat RT",
            roleId: adminRole.id,
        },
    });

    const warga = await prisma.user.upsert({
        where: {
            email: "warga@rtinventory.test",
        },
        update: {
            roleId: wargaRole.id,
        },
        create: {
            name: "Budi Santoso",
            email: "warga@rtinventory.test",
            passwordHash: wargaPasswordHash,
            phone: "081298765432",
            address: "Jl. Melati No. 10",
            roleId: wargaRole.id,
        },
    });

    const furnitureCategory = await prisma.category.upsert({
        where: {
            name: "Furniture",
        },
        update: {},
        create: {
            name: "Furniture",
            description: "Meja, kursi, dan perlengkapan furniture",
        },
    });

    const electronicsCategory = await prisma.category.upsert({
        where: {
            name: "Elektronik",
        },
        update: {},
        create: {
            name: "Elektronik",
            description: "Peralatan elektronik milik RT",
        },
    });

    const eventCategory = await prisma.category.upsert({
        where: {
            name: "Perlengkapan Acara",
        },
        update: {},
        create: {
            name: "Perlengkapan Acara",
            description: "Perlengkapan untuk acara warga",
        },
    });

    await prisma.item.upsert({
        where: {
            code: "KRS-001",
        },
        update: {},
        create: {
            name: "Kursi Plastik",
            code: "KRS-001",
            description: "Kursi plastik untuk kegiatan warga",
            quantity: 100,
            available: 100,
            condition: "BAIK",
            categoryId: furnitureCategory.id,
        },
    });

    await prisma.item.upsert({
        where: {
            code: "MJL-001",
        },
        update: {},
        create: {
            name: "Meja Lipat",
            code: "MJL-001",
            description: "Meja lipat untuk rapat dan acara warga",
            quantity: 20,
            available: 20,
            condition: "BAIK",
            categoryId: furnitureCategory.id,
        },
    });

    await prisma.item.upsert({
        where: {
            code: "SND-001",
        },
        update: {},
        create: {
            name: "Sound System",
            code: "SND-001",
            description: "Sound system untuk kegiatan RT",
            quantity: 2,
            available: 2,
            condition: "BAIK",
            categoryId: electronicsCategory.id,
        },
    });

    await prisma.item.upsert({
        where: {
            code: "TEN-001",
        },
        update: {},
        create: {
            name: "Tenda Lipat",
            code: "TEN-001",
            description: "Tenda lipat untuk kegiatan outdoor",
            quantity: 5,
            available: 5,
            condition: "BAIK",
            categoryId: eventCategory.id,
        },
    });

    await prisma.item.upsert({
        where: {
            code: "KBL-001",
        },
        update: {},
        create: {
            name: "Kabel Roll",
            code: "KBL-001",
            description: "Kabel roll untuk kebutuhan listrik acara",
            quantity: 8,
            available: 8,
            condition: "BAIK",
            categoryId: electronicsCategory.id,
        },
    });

    console.log("Seed completed successfully");
    console.log("Admin:", admin.email);
    console.log("Warga:", warga.email);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });