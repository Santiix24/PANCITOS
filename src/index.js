import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ShoppingCart, BookOpen, Edit2, Trash2, Eye, EyeOff, Download, Zap, TrendingUp, } from 'lucide-react';
import html2canvas from 'html2canvas';
// Matriz de permisos centralizada
const PERMS = {
    canEditRecipes: (r) => ['superadmin', 'admin', 'baker'].includes(r),
    canUseCalculator: (r) => ['superadmin', 'admin', 'baker', 'personal', 'readonly'].includes(r),
    canViewInventory: (r) => ['superadmin', 'admin', 'baker'].includes(r),
    canEditInventory: (r) => ['superadmin', 'admin'].includes(r),
    canViewCosts: (r) => ['superadmin', 'admin'].includes(r),
};
// ============================================================================
// ZUSTAND STORE SIMPLIFICADO
// ============================================================================
const useStore = (() => {
    let state;
    const listeners = new Set();
    const defaultRecipes = [
        {
            id: '1',
            name: 'Pan Francés Tradicional',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina de trigo', quantity: 500, unit: 'g' },
                { id: '2', name: 'Agua', quantity: 300, unit: 'ml' },
                { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
                { id: '4', name: 'Levadura fresca', quantity: 10, unit: 'g' },
            ],
            temperature: 220,
            time: 45,
            instructions: 'Mezclar ingredientes, fermentar 2 horas, formar y hornear. Clásico de la panadería francesa.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Pan Integral Saludable',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina integral', quantity: 400, unit: 'g' },
                { id: '2', name: 'Harina de trigo', quantity: 100, unit: 'g' },
                { id: '3', name: 'Agua tibia', quantity: 320, unit: 'ml' },
                { id: '4', name: 'Sal', quantity: 8, unit: 'g' },
                { id: '5', name: 'Levadura', quantity: 7, unit: 'g' },
                { id: '6', name: 'Miel', quantity: 20, unit: 'ml' },
            ],
            temperature: 200,
            time: 50,
            instructions: 'Mezclar harinas y agua, dejar reposar 30 min, agregar levadura, fermentar lentamente y hornear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '3',
            name: 'Croissant Francés Premium',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 250, unit: 'g' },
                { id: '3', name: 'Leche', quantity: 250, unit: 'ml' },
                { id: '4', name: 'Azúcar', quantity: 50, unit: 'g' },
                { id: '5', name: 'Sal', quantity: 10, unit: 'g' },
                { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
            ],
            temperature: 200,
            time: 30,
            instructions: 'Preparar masa madre, laminación con mantequilla, doblados, corte en triángulos, fermentar y hornear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '4',
            name: 'Torta de Chocolate Jugosa',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
                { id: '2', name: 'Cacao en polvo', quantity: 60, unit: 'g' },
                { id: '3', name: 'Azúcar', quantity: 350, unit: 'g' },
                { id: '4', name: 'Huevos', quantity: 4, unit: 'unid' },
                { id: '5', name: 'Mantequilla', quantity: 150, unit: 'g' },
                { id: '6', name: 'Leche', quantity: 200, unit: 'ml' },
                { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
            ],
            temperature: 180,
            time: 35,
            instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar secos, hornear hasta que pase el palillo.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '5',
            name: 'Cheesecake New York',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Galletas digestivas', quantity: 200, unit: 'g' },
                { id: '2', name: 'Mantequilla derretida', quantity: 100, unit: 'g' },
                { id: '3', name: 'Queso crema', quantity: 600, unit: 'g' },
                { id: '4', name: 'Azúcar', quantity: 150, unit: 'g' },
                { id: '5', name: 'Huevos', quantity: 3, unit: 'unid' },
                { id: '6', name: 'Crema ácida', quantity: 200, unit: 'ml' },
                { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
            ],
            temperature: 170,
            time: 60,
            instructions: 'Base de galletas, mezclar queso crema con azúcar, agregar huevos lentamente, hornear a baño maría.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '6',
            name: 'Pan de Canela y Azúcar',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 400, unit: 'g' },
                { id: '2', name: 'Leche tibia', quantity: 200, unit: 'ml' },
                { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
                { id: '4', name: 'Mantequilla', quantity: 80, unit: 'g' },
                { id: '5', name: 'Azúcar', quantity: 100, unit: 'g' },
                { id: '6', name: 'Canela molida', quantity: 15, unit: 'g' },
                { id: '7', name: 'Levadura', quantity: 10, unit: 'g' },
            ],
            temperature: 190,
            time: 40,
            instructions: 'Masa dulce, enrollar con mezcla de canela y azúcar, fermentar, hornear hasta dorados.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '7',
            name: 'Donas Glaseadas Clásicas',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
                { id: '2', name: 'Azúcar', quantity: 80, unit: 'g' },
                { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
                { id: '4', name: 'Leche', quantity: 150, unit: 'ml' },
                { id: '5', name: 'Levadura en polvo', quantity: 10, unit: 'g' },
                { id: '6', name: 'Aceite', quantity: 60, unit: 'ml' },
                { id: '7', name: 'Vainilla', quantity: 5, unit: 'ml' },
            ],
            temperature: 180,
            time: 25,
            instructions: 'Mezclar ingredientes secos, agregar húmedos, freír en aceite caliente, glasear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '8',
            name: 'Brownies de Chocolate Negro',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Chocolate negro', quantity: 200, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
                { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
                { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
                { id: '5', name: 'Harina', quantity: 100, unit: 'g' },
                { id: '6', name: 'Polvo de hornear', quantity: 5, unit: 'g' },
                { id: '7', name: 'Nueces', quantity: 100, unit: 'g' },
            ],
            temperature: 175,
            time: 30,
            instructions: 'Derretir chocolate y mantequilla, mezclar con azúcar y huevos, agregar harina, hornear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '9',
            name: 'Tarta de Fresas y Crema',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
                { id: '2', name: 'Azúcar', quantity: 100, unit: 'g' },
                { id: '3', name: 'Huevos', quantity: 3, unit: 'unid' },
                { id: '4', name: 'Mantequilla', quantity: 100, unit: 'g' },
                { id: '5', name: 'Crema para batir', quantity: 300, unit: 'ml' },
                { id: '6', name: 'Fresas frescas', quantity: 400, unit: 'g' },
                { id: '7', name: 'Mermelada de fresa', quantity: 100, unit: 'ml' },
            ],
            temperature: 190,
            time: 35,
            instructions: 'Bizcocho base, crema batida con azúcar, colocar fresas, decorar con mermelada.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '10',
            name: 'Pan de Ajo Casero',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Pan francés', quantity: 600, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
                { id: '3', name: 'Ajo molido', quantity: 30, unit: 'g' },
                { id: '4', name: 'Perejil fresco', quantity: 20, unit: 'g' },
                { id: '5', name: 'Sal', quantity: 5, unit: 'g' },
                { id: '6', name: 'Pimienta negra', quantity: 3, unit: 'g' },
            ],
            temperature: 200,
            time: 15,
            instructions: 'Mezclar mantequilla con ajo y perejil, untar pan cortado, envolver y hornear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '11',
            name: 'Empanadas Rellenas de Carne',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 100, unit: 'g' },
                { id: '3', name: 'Agua', quantity: 200, unit: 'ml' },
                { id: '4', name: 'Carne molida', quantity: 400, unit: 'g' },
                { id: '5', name: 'Cebolla', quantity: 150, unit: 'g' },
                { id: '6', name: 'Ajo', quantity: 20, unit: 'g' },
                { id: '7', name: 'Huevo', quantity: 1, unit: 'unid' },
            ],
            temperature: 200,
            time: 25,
            instructions: 'Preparar masa, relleno de carne salteada, cerrar bien, pintar con huevo y hornear hasta dorado.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '12',
            name: 'Tres Leches Premium',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
                { id: '2', name: 'Huevos', quantity: 4, unit: 'unid' },
                { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
                { id: '4', name: 'Leche condensada', quantity: 400, unit: 'ml' },
                { id: '5', name: 'Leche evaporada', quantity: 400, unit: 'ml' },
                { id: '6', name: 'Crema de leche', quantity: 200, unit: 'ml' },
                { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
            ],
            temperature: 180,
            time: 30,
            instructions: 'Bizcocho esponjoso, mezclar tres leches, verter sobre el bizcocho, refrigerar 4 horas.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '13',
            name: 'Moka de Café',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
                { id: '2', name: 'Cacao en polvo', quantity: 50, unit: 'g' },
                { id: '3', name: 'Café molido', quantity: 30, unit: 'g' },
                { id: '4', name: 'Azúcar', quantity: 250, unit: 'g' },
                { id: '5', name: 'Huevos', quantity: 4, unit: 'unid' },
                { id: '6', name: 'Mantequilla', quantity: 150, unit: 'g' },
                { id: '7', name: 'Crema para batir', quantity: 400, unit: 'ml' },
            ],
            temperature: 175,
            time: 35,
            instructions: 'Bizcochos de café y chocolate, relleno y cobertura de crema de café, decorar con polvo de café.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '14',
            name: 'Pan de Molde Blanco',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina de fuerza', quantity: 600, unit: 'g' },
                { id: '2', name: 'Agua', quantity: 350, unit: 'ml' },
                { id: '3', name: 'Sal', quantity: 12, unit: 'g' },
                { id: '4', name: 'Levadura fresca', quantity: 12, unit: 'g' },
                { id: '5', name: 'Azúcar', quantity: 20, unit: 'g' },
                { id: '6', name: 'Mantequilla', quantity: 50, unit: 'g' },
            ],
            temperature: 210,
            time: 50,
            instructions: 'Amasar, primera fermentación 2 horas, moldear, segunda fermentación 1 hora, hornear.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '15',
            name: 'Tartaleta de Manzana',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 120, unit: 'g' },
                { id: '3', name: 'Azúcar', quantity: 80, unit: 'g' },
                { id: '4', name: 'Huevo', quantity: 1, unit: 'unid' },
                { id: '5', name: 'Manzanas verdes', quantity: 500, unit: 'g' },
                { id: '6', name: 'Canela', quantity: 10, unit: 'g' },
                { id: '7', name: 'Mermelada de albaricoque', quantity: 100, unit: 'ml' },
            ],
            temperature: 190,
            time: 40,
            instructions: 'Masa quebrada, relleno de manzanas con canela, cubrir con mermelada, hornear hasta dorado.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '16',
            name: 'Baguette Francesa',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina de fuerza', quantity: 500, unit: 'g' },
                { id: '2', name: 'Agua', quantity: 310, unit: 'ml' },
                { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
                { id: '4', name: 'Levadura fresca', quantity: 8, unit: 'g' },
            ],
            temperature: 240,
            time: 40,
            instructions: 'Masa hueca, fermentación larga, cortes característicos, hornear a vapor inicial.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '17',
            name: 'Strudel de Manzana',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
                { id: '2', name: 'Huevos', quantity: 3, unit: 'unid' },
                { id: '3', name: 'Mantequilla', quantity: 100, unit: 'g' },
                { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
                { id: '5', name: 'Manzanas', quantity: 600, unit: 'g' },
                { id: '6', name: 'Pasas', quantity: 80, unit: 'g' },
                { id: '7', name: 'Canela', quantity: 15, unit: 'g' },
            ],
            temperature: 180,
            time: 50,
            instructions: 'Masa estirada finamente, relleno de manzanas condimentadas, enrollar, hornear lentamente.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '18',
            name: 'Magdalenas Caseras',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 200, unit: 'g' },
                { id: '2', name: 'Azúcar', quantity: 200, unit: 'g' },
                { id: '3', name: 'Mantequilla', quantity: 150, unit: 'g' },
                { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
                { id: '5', name: 'Leche', quantity: 100, unit: 'ml' },
                { id: '6', name: 'Vainilla', quantity: 10, unit: 'ml' },
                { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
            ],
            temperature: 200,
            time: 20,
            instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar con harinas y leche, hornear en moldes.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '19',
            name: 'Ensaimada Mallorquina',
            category: 'Panadería',
            ingredients: [
                { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
                { id: '2', name: 'Mantequilla', quantity: 200, unit: 'g' },
                { id: '3', name: 'Leche', quantity: 200, unit: 'ml' },
                { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
                { id: '5', name: 'Huevos', quantity: 2, unit: 'unid' },
                { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
                { id: '7', name: 'Sal', quantity: 8, unit: 'g' },
            ],
            temperature: 190,
            time: 45,
            instructions: 'Masa dulce, laminación con mantequilla, enrollada en espiral, fermentación y horneado.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
        {
            id: '20',
            name: 'Tiramisú Italiano',
            category: 'Pastelería',
            ingredients: [
                { id: '1', name: 'Yemas de huevo', quantity: 6, unit: 'unid' },
                { id: '2', name: 'Azúcar', quantity: 150, unit: 'g' },
                { id: '3', name: 'Mascarpone', quantity: 600, unit: 'g' },
                { id: '4', name: 'Café espresso', quantity: 400, unit: 'ml' },
                { id: '5', name: 'Ron o Marsala', quantity: 50, unit: 'ml' },
                { id: '6', name: 'Galletas de soletilla', quantity: 300, unit: 'g' },
                { id: '7', name: 'Cacao en polvo', quantity: 30, unit: 'g' },
            ],
            temperature: 0,
            time: 480,
            instructions: 'Crema de mascarpone sobre café, capas de galletas, espolvorear cacao, refrigerar 8 horas.',
            createdBy: 'Administrador',
            createdAt: new Date().toISOString(),
        },
    ];
    const defaultOperations = [
        { id: '1', name: 'Harina de trigo', type: 'kg', presentationWeight: 25, unitsPurchased: 4, totalCost: 180000 },
        { id: '2', name: 'Harina integral', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 95000 },
        { id: '3', name: 'Agua', type: 'L', presentationWeight: 1, unitsPurchased: 100, totalCost: 5000 },
        { id: '4', name: 'Sal', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 12000 },
        { id: '5', name: 'Levadura fresca', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 45000 },
        { id: '6', name: 'Mantequilla', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 280000 },
        { id: '7', name: 'Azúcar', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 25000 },
        { id: '8', name: 'Huevos', type: 'unid', presentationWeight: 1, unitsPurchased: 360, totalCost: 72000 },
        { id: '9', name: 'Leche', type: 'L', presentationWeight: 1, unitsPurchased: 40, totalCost: 48000 },
        { id: '10', name: 'Cacao en polvo', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 85000 },
        { id: '11', name: 'Chocolate negro', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 135000 },
        { id: '12', name: 'Queso crema', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 160000 },
        { id: '13', name: 'Crema ácida', type: 'L', presentationWeight: 1, unitsPurchased: 3, totalCost: 45000 },
        { id: '14', name: 'Vainilla', type: 'L', presentationWeight: 1, unitsPurchased: 1, totalCost: 28000 },
        { id: '15', name: 'Polvo de hornear', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 18000 },
        { id: '16', name: 'Aceite', type: 'L', presentationWeight: 1, unitsPurchased: 4, totalCost: 36000 },
        { id: '17', name: 'Canela molida', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 32000 },
        { id: '18', name: 'Perejil fresco', type: 'kg', presentationWeight: 0.2, unitsPurchased: 5, totalCost: 15000 },
        { id: '19', name: 'Ajo molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 12000 },
        { id: '20', name: 'Fresas frescas', type: 'kg', presentationWeight: 1, unitsPurchased: 4, totalCost: 64000 },
        { id: '21', name: 'Mermelada de fresa', type: 'L', presentationWeight: 1, unitsPurchased: 2, totalCost: 36000 },
        { id: '22', name: 'Levadura en polvo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 16000 },
        { id: '23', name: 'Nueces', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 85000 },
        { id: '24', name: 'Galletas digestivas', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 32000 },
        { id: '25', name: 'Carne molida', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 95000 },
        { id: '26', name: 'Cebolla', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 24000 },
        { id: '27', name: 'Leche condensada', type: 'L', presentationWeight: 0.4, unitsPurchased: 10, totalCost: 80000 },
        { id: '28', name: 'Café molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 48000 },
        { id: '29', name: 'Manzanas verdes', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 35000 },
        { id: '30', name: 'Pasas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 32000 },
    ];
    const loadFromStorage = () => {
        try {
            const saved = localStorage.getItem('calipan-state');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Combinar con recetas por defecto si no hay recetas guardadas
                if (!parsed.recipes || parsed.recipes.length === 0) {
                    parsed.recipes = defaultRecipes;
                }
                // Combinar con operaciones por defecto si no hay operaciones guardadas
                if (!parsed.operations || parsed.operations.length === 0) {
                    parsed.operations = defaultOperations;
                }
                return parsed;
            }
        }
        catch (error) {
            console.error('Error loading state:', error);
        }
        return {
            user: null,
            recipes: defaultRecipes,
            operations: defaultOperations,
            rememberMe: false,
            setUser: () => { },
            addRecipe: () => { },
            updateRecipe: () => { },
            deleteRecipe: () => { },
            addOperation: () => { },
            updateOperation: () => { },
            deleteOperation: () => { },
            setRememberMe: () => { },
        };
    };
    const saveToStorage = () => {
        try {
            const toSave = {
                user: state.user,
                recipes: state.recipes,
                operations: state.operations,
                rememberMe: state.rememberMe,
            };
            localStorage.setItem('calipan-state', JSON.stringify(toSave));
        }
        catch (error) {
            console.error('Error saving state:', error);
        }
    };
    state = {
        ...loadFromStorage(),
        setUser: (user) => {
            state.user = user;
            saveToStorage();
            notifyListeners();
        },
        addRecipe: (recipe) => {
            state.recipes.push(recipe);
            saveToStorage();
            notifyListeners();
        },
        updateRecipe: (id, recipe) => {
            const index = state.recipes.findIndex((r) => r.id === id);
            if (index !== -1) {
                state.recipes[index] = recipe;
                saveToStorage();
                notifyListeners();
            }
        },
        deleteRecipe: (id) => {
            state.recipes = state.recipes.filter((r) => r.id !== id);
            saveToStorage();
            notifyListeners();
        },
        addOperation: (op) => {
            state.operations.push(op);
            saveToStorage();
            notifyListeners();
        },
        updateOperation: (id, op) => {
            const index = state.operations.findIndex((o) => o.id === id);
            if (index !== -1) {
                state.operations[index] = op;
                saveToStorage();
                notifyListeners();
            }
        },
        deleteOperation: (id) => {
            state.operations = state.operations.filter((o) => o.id !== id);
            saveToStorage();
            notifyListeners();
        },
        setRememberMe: (value) => {
            state.rememberMe = value;
            saveToStorage();
            notifyListeners();
        },
    };
    const notifyListeners = () => {
        listeners.forEach((listener) => listener());
    };
    return {
        getState: () => state,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                if (listeners.has(listener))
                    listeners.delete(listener);
            };
        },
    };
})();
function useAppState() {
    const [, setVersion] = useState(0);
    const stateRef = useRef(null);
    useEffect(() => {
        if (!stateRef.current) {
            stateRef.current = useStore.getState();
        }
        const unsubscribe = useStore.subscribe(() => {
            stateRef.current = useStore.getState();
            setVersion((v) => v + 1);
        });
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);
    return stateRef.current || useStore.getState();
}
// ============================================================================
// CREDENCIALES
// ============================================================================
const CREDENTIALS = {
    // 👑 Dueño: acceso completo a todo, incluye costos y gestión
    'Administrador': { password: 'Administrador2026', role: 'superadmin', label: 'Dueño / Super Admin', emoji: '👑' },
    // 👨‍🍳 Panadero jefe: CRUD recetas + calculadora + ver inventario (sin costos)
    'calipan': { password: 'calipan2026', role: 'baker', label: 'Panadero Jefe Calipan', emoji: '👨‍🍳' },
    // 👁️ Familia: solo ver recetas + calculadora (sin inventario ni costos)
    'familia': { password: 'familia2026', role: 'readonly', label: 'Familia / Consulta', emoji: '👨‍👩‍👧' },
    // 🏭 Personal nac.: ver recetas + calculadora (uso en producción, sin costos)
    'solonacional': { password: 'solonacional2026', role: 'personal', label: 'Personal Sucursal', emoji: '🏭' },
};
const ROLE_INFO = {
    superadmin: { label: 'Dueño / Super Admin', badge: 'bg-yellow-400/30 text-yellow-100', emoji: '👑' },
    admin: { label: 'Administrador', badge: 'bg-blue-400/30 text-blue-100', emoji: '🔑' },
    baker: { label: 'Panadero Jefe', badge: 'bg-orange-400/30 text-orange-100', emoji: '👨‍🍳' },
    readonly: { label: 'Familia / Consulta', badge: 'bg-purple-400/30 text-purple-100', emoji: '👨‍👩‍👧' },
    personal: { label: 'Personal Sucursal', badge: 'bg-green-400/30 text-green-100', emoji: '🏭' },
};
// ============================================================================
// LOGIN PAGE - ULTRA BONITA Y DINÁMICA
// ============================================================================
// ============================================================================
// LOGIN FORM PANEL — definido FUERA del LoginPage para evitar pérdida de foco
// ============================================================================
const LoginFormPanel = ({ username, setUsername, password, setPassword, showPassword, setShowPassword, remember, setRemember, error, isLoading, quickLogin }) => (_jsxs("div", { className: "w-full space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-black text-cream mb-2", children: "\uD83D\uDC64 USUARIO" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-5 py-4 rounded-2xl bg-white/15 border-2 border-white/30 text-cream placeholder-cream/50 focus:outline-none focus:border-cream focus:bg-white/20 transition-all text-lg font-bold backdrop-blur", placeholder: "calipan", autoComplete: "username" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-black text-cream mb-2", children: "\uD83D\uDD10 CONTRASE\u00D1A" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-5 py-4 rounded-2xl bg-white/15 border-2 border-white/30 text-cream placeholder-cream/50 focus:outline-none focus:border-cream focus:bg-white/20 transition-all text-lg font-bold backdrop-blur", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-cream/70 hover:text-cream transition-colors", children: showPassword ? _jsx(EyeOff, { size: 22 }) : _jsx(Eye, { size: 22 }) })] })] }), _jsx(AnimatePresence, { children: error && (_jsx(motion.div, { initial: { opacity: 0, y: -8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0 }, className: "bg-red-500/30 border-2 border-red-400/50 text-red-100 px-5 py-3 rounded-2xl text-sm text-center font-bold", children: error })) }), _jsxs("label", { className: "flex items-center gap-3 text-cream text-sm cursor-pointer font-bold", children: [_jsx("input", { type: "checkbox", checked: remember, onChange: (e) => setRemember(e.target.checked), className: "w-5 h-5 rounded-lg accent-cream cursor-pointer" }), "Recordar credenciales"] }), _jsx(motion.button, { whileHover: { scale: 1.04, boxShadow: '0 20px 40px rgba(255,255,255,0.2)' }, whileTap: { scale: 0.93 }, type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-cream to-cream/90 hover:from-cream hover:to-cream text-primary font-black py-4 rounded-2xl text-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.span, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity }, children: "\u26A1" }), " INGRESANDO..."] })) : '✅ INGRESAR' }), _jsxs("div", { children: [_jsx("p", { className: "text-cream/60 text-center text-xs font-black tracking-widest mb-3", children: "\u26A1 ACCESO R\u00C1PIDO" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                        { user: 'Administrador', label: 'DUEÑO', icon: '👑' },
                        { user: 'calipan', label: 'PANADERO', icon: '👨‍🍳' },
                        { user: 'familia', label: 'FAMILIA', icon: '👨‍👩‍👧' },
                        { user: 'solonacional', label: 'PERSONAL', icon: '🏭' },
                    ].map((q) => (_jsxs(motion.button, { type: "button", whileHover: { scale: 1.05, y: -2 }, whileTap: { scale: 0.92 }, onClick: () => quickLogin(q.user), className: "bg-white/20 hover:bg-white/30 backdrop-blur border border-white/40 text-cream py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2", children: [_jsx("span", { className: "text-lg", children: q.icon }), _jsx("span", { children: q.label })] }, q.user))) })] })] }));
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('calipan-remember');
        if (saved) {
            const creds = JSON.parse(saved);
            setUsername(creds.username);
            setRemember(true);
        }
    }, []);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        // Simulate login delay for more dynamic feel
        setTimeout(() => {
            const cred = CREDENTIALS[username];
            if (!cred || cred.password !== password) {
                setError('❌ Usuario o contraseña incorrectos');
                setIsLoading(false);
                return;
            }
            if (remember) {
                localStorage.setItem('calipan-remember', JSON.stringify({ username }));
            }
            else {
                localStorage.removeItem('calipan-remember');
            }
            onLogin({ username, role: cred.role }, remember);
        }, 300);
    };
    const quickLogin = (user) => {
        const cred = CREDENTIALS[user];
        if (cred) {
            onLogin({ username: user, role: cred.role }, false);
        }
    };
    /* nada — FormPanel fue extraído fuera como LoginFormPanel */
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "min-h-screen bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden", children: [_jsx(motion.div, { animate: { y: [0, -50, 0], x: [0, 30, 0] }, transition: { duration: 8, repeat: Infinity }, className: "absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" }), _jsx(motion.div, { animate: { y: [0, 50, 0], x: [0, -30, 0] }, transition: { duration: 10, repeat: Infinity, delay: 1 }, className: "absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "lg:hidden min-h-screen flex flex-col items-center justify-center p-5", children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.1, type: 'spring', stiffness: 100 }, className: "w-full max-w-sm", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 6, repeat: Infinity }, className: "text-7xl inline-block mb-4 drop-shadow-2xl", children: "\uD83E\uDD50" }), _jsx("h1", { className: "text-4xl font-black font-playfair text-cream mb-1", children: "CALIPAN VIRREY" }), _jsx("p", { className: "text-cream/80 text-sm font-bold tracking-widest", children: "PANADER\u00CDA PREMIUM" })] }), _jsx("div", { className: "glass rounded-3xl p-6 backdrop-blur-xl border border-white/30 shadow-2xl", children: _jsx("form", { onSubmit: handleLogin, children: _jsx(LoginFormPanel, { username: username, setUsername: setUsername, password: password, setPassword: setPassword, showPassword: showPassword, setShowPassword: setShowPassword, remember: remember, setRemember: setRemember, error: error, isLoading: isLoading, quickLogin: quickLogin }) }) }), _jsx("p", { className: "text-cream/40 text-xs text-center mt-6", children: "\uD83D\uDD12 Datos seguros offline" })] }) }), _jsxs("div", { className: "hidden lg:flex min-h-screen", children: [_jsx(motion.div, { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: 'easeOut' }, className: "w-[55%] flex flex-col items-center justify-center p-16 relative", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx(motion.div, { animate: { rotate: 360, scale: [1, 1.05, 1] }, transition: { duration: 8, repeat: Infinity }, className: "text-[120px] leading-none mb-8 drop-shadow-2xl", children: "\uD83E\uDD50" }), _jsxs("h1", { className: "text-7xl font-black font-playfair text-cream mb-4 leading-tight", children: ["CALIPAN", _jsx("br", {}), "VIRREY"] }), _jsx("p", { className: "text-cream/80 text-xl font-bold tracking-[0.3em] mb-12", children: "PANADER\u00CDA PREMIUM" }), _jsx("div", { className: "grid grid-cols-2 gap-4 text-left", children: [
                                        { icon: '📖', title: '20 Recetas', desc: 'Pan, pasteles y más' },
                                        { icon: '🧮', title: 'Calculadora', desc: 'Escala ingredientes' },
                                        { icon: '🛒', title: 'Inventario', desc: '30 insumos listos' },
                                        { icon: '💰', title: 'Costos', desc: 'Analiza márgenes' },
                                    ].map((f) => (_jsxs(motion.div, { whileHover: { scale: 1.04, y: -3 }, className: "bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4", children: [_jsx("div", { className: "text-3xl mb-1", children: f.icon }), _jsx("p", { className: "text-cream font-black text-sm", children: f.title }), _jsx("p", { className: "text-cream/60 text-xs", children: f.desc })] }, f.title))) }), _jsxs("div", { className: "mt-10 flex items-center justify-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-cream/60 rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("div", { className: "w-2 h-2 bg-cream/60 rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("div", { className: "w-2 h-2 bg-cream/60 rounded-full animate-bounce", style: { animationDelay: '300ms' } })] })] }) }), _jsx(motion.div, { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 }, className: "w-[45%] flex items-center justify-center p-12 bg-black/20 backdrop-blur-sm border-l border-white/10", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-3xl font-black text-cream mb-1", children: "Bienvenido" }), _jsx("p", { className: "text-cream/60 text-sm font-bold", children: "Ingresa tus credenciales para continuar" })] }), _jsx("form", { onSubmit: handleLogin, children: _jsx(LoginFormPanel, { username: username, setUsername: setUsername, password: password, setPassword: setPassword, showPassword: showPassword, setShowPassword: setShowPassword, remember: remember, setRemember: setRemember, error: error, isLoading: isLoading, quickLogin: quickLogin }) }), _jsx("p", { className: "text-cream/30 text-xs text-center mt-8", children: "\uD83D\uDD12 Datos seguros \u00B7 Modo offline disponible" })] }) })] })] }));
};
// ============================================================================
// HOME DASHBOARD - ULTRA DINÁMICO Y HERMOSO
// ============================================================================
const HomePage = ({ user, stats, onNavigate }) => {
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "relative overflow-hidden rounded-3xl p-6 lg:p-10 bg-gradient-to-br from-secondary via-primary to-secondary/90", children: [_jsx(motion.div, { animate: { scale: [1, 1.1, 1], rotate: [0, 360] }, transition: { duration: 8, repeat: Infinity }, className: "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" }), _jsxs("div", { className: "relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-4", children: [_jsx(motion.div, { animate: { y: [0, -8, 0] }, transition: { duration: 2, repeat: Infinity }, className: "text-6xl lg:text-8xl", children: "\uD83E\uDD50" }), _jsxs("div", { className: "text-center lg:text-left", children: [_jsxs("h2", { className: "text-3xl lg:text-5xl font-bold font-playfair text-cream mb-2", children: ["\u00A1Hola, ", user.username, "!"] }), _jsx("p", { className: "text-cream/70 text-sm mb-3", children: "Bienvenido de vuelta a tu panel de control" }), _jsxs("span", { className: "inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full text-cream text-xs font-black border border-white/30", children: [user.role === 'superadmin' && '👑 Dueño / Super Admin', user.role === 'admin' && '🔑 Administrador', user.role === 'baker' && '👨‍🍳 Panadero Jefe', user.role === 'readonly' && '👨‍👩‍👧 Familia / Consulta', user.role === 'personal' && '🏭 Personal Sucursal'] })] })] })] }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
                    { label: 'RECETAS', value: stats.recipes, icon: '📖', color: 'orange', view: 'recipes', enabled: true },
                    { label: 'INVENTARIO', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '🛒', color: 'blue', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
                    { label: 'PORCIONES', value: stats.recipes > 0 ? Math.floor(stats.recipes * 3) : '—', icon: '🥐', color: 'purple', view: 'calculator', enabled: PERMS.canUseCalculator(user.role) },
                    { label: 'INSUMOS', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '📦', color: 'green', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
                ].map((stat, i) => (_jsxs(motion.button, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.1 + i * 0.05 }, whileHover: { y: -5 }, whileTap: { scale: 0.93 }, onClick: () => stat.enabled && onNavigate(stat.view), disabled: !stat.enabled, className: `rounded-3xl p-5 lg:p-6 text-left shadow-lg transition-all duration-300 border-2 ${stat.enabled
                        ? `bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-50 dark:from-${stat.color}-900/40 dark:to-${stat.color}-900/20 border-${stat.color}-200 dark:border-${stat.color}-700 hover:shadow-2xl cursor-pointer`
                        : 'bg-gray-100 dark:bg-gray-800 opacity-40 cursor-not-allowed border-gray-300'}`, children: [_jsx(motion.div, { animate: { scale: [1, 1.15, 1] }, transition: { duration: 2, repeat: Infinity, delay: i * 0.3 }, className: "text-4xl mb-3", children: stat.icon }), _jsx("p", { className: "text-xs font-black opacity-70 mb-1", children: stat.label }), _jsx("p", { className: "text-3xl font-black", children: stat.value })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 }, whileHover: { scale: 1.03, boxShadow: '0 25px 50px rgba(74,55,40,0.3)' }, whileTap: { scale: 0.93 }, onClick: () => onNavigate('recipes'), className: "w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-cream py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl", children: [_jsx(motion.span, { animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(BookOpen, { size: 28 }) }), _jsx("span", { children: "\uD83D\uDCD6 RECETAS" })] }), _jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.25 }, whileHover: { scale: 1.03, boxShadow: '0 25px 50px rgba(164,112,62,0.3)' }, whileTap: { scale: 0.93 }, onClick: () => onNavigate('calculator'), className: "w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-cream py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl", children: [_jsx(motion.span, { animate: { rotate: [-10, 10, -10] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(Zap, { size: 28 }) }), _jsx("span", { children: "\uD83E\uDDEE ESCALAR RECETA" })] }), PERMS.canViewInventory(user.role) && (_jsxs(_Fragment, { children: [_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 }, whileHover: { scale: 1.03, boxShadow: '0 25px 50px rgba(37,99,235,0.3)' }, whileTap: { scale: 0.93 }, onClick: () => onNavigate('inventory'), className: "w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl", children: [_jsx(motion.span, { animate: { y: [0, -5, 0] }, transition: { duration: 1.5, repeat: Infinity }, children: _jsx(ShoppingCart, { size: 28 }) }), _jsx("span", { children: "\uD83D\uDED2 INVENTARIO" })] }), PERMS.canViewCosts(user.role) && (_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.35 }, whileHover: { scale: 1.03, boxShadow: '0 25px 50px rgba(34,197,94,0.3)' }, whileTap: { scale: 0.93 }, onClick: () => onNavigate('costs'), className: "w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl", children: [_jsx(motion.span, { animate: { scale: [1, 1.2, 1] }, transition: { duration: 1.5, repeat: Infinity }, children: _jsx(TrendingUp, { size: 28 }) }), _jsx("span", { children: "\uD83D\uDCB0 AN\u00C1LISIS COSTOS" })] }))] }))] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "grid grid-cols-3 gap-3", children: [
                    { icon: '✨', text: 'Glassmorphism UI' },
                    { icon: '⚡', text: 'Ultra rápido' },
                    { icon: '💾', text: 'Guarda offline' },
                ].map((info) => (_jsxs("div", { className: "bg-indigo-500/10 dark:bg-indigo-900/30 border border-indigo-300/40 rounded-2xl p-4 text-center", children: [_jsx("div", { className: "text-2xl mb-1", children: info.icon }), _jsx("p", { className: "text-xs font-bold text-indigo-800 dark:text-indigo-300", children: info.text })] }, info.text))) })] }));
};
// ============================================================================
// MOBILE NAVBAR - ULTRA DINÁMICA
// ============================================================================
const MobileNavbar = ({ user, currentView, onViewChange, onLogout }) => {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: '🏠', color: 'text-purple-300', dot: 'bg-purple-400' },
        { id: 'recipes', label: 'Recetas', icon: '📖', color: 'text-orange-300', dot: 'bg-orange-400' },
        ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calcular', icon: '🧮', color: 'text-yellow-300', dot: 'bg-yellow-400' }] : []),
        ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory', label: 'Inventario', icon: '🛒', color: 'text-blue-300', dot: 'bg-blue-400' }] : []),
        ...(PERMS.canViewCosts(user.role) ? [{ id: 'costs', label: 'Costos', icon: '💰', color: 'text-green-300', dot: 'bg-green-400' }] : []),
    ];
    return (_jsx(motion.div, { initial: { y: 100 }, animate: { y: 0 }, className: "fixed bottom-0 left-0 right-0 bg-gradient-to-t from-primary/98 to-primary/90 backdrop-blur-xl border-t border-secondary/20 z-40 shadow-2xl pb-safe", children: _jsxs("div", { className: "flex justify-around items-end px-1 pt-2 pb-3", children: [navItems.map((item) => {
                    const active = currentView === item.id;
                    return (_jsxs(motion.button, { whileTap: { scale: 0.82 }, onClick: () => onViewChange(item.id), className: "flex-1 flex flex-col items-center gap-1 relative py-1 px-0.5 rounded-xl transition-all min-w-0", children: [active && (_jsx(motion.div, { layoutId: "mobileActiveNav", className: "absolute inset-0 bg-white/10 rounded-xl", transition: { type: 'spring', stiffness: 400, damping: 30 } })), active && (_jsx(motion.div, { layoutId: "mobileDot", className: `absolute -top-1 w-6 h-1 rounded-full ${item.dot}`, transition: { type: 'spring', stiffness: 400, damping: 30 } })), _jsx(motion.span, { animate: active ? { scale: [1, 1.25, 1] } : { scale: 1 }, transition: { duration: 0.4 }, className: "text-2xl relative z-10", children: item.icon }), _jsx("span", { className: `text-[9px] font-black relative z-10 leading-none truncate w-full text-center ${active ? item.color : 'text-cream/45'}`, children: item.label })] }, item.id));
                }), _jsxs(motion.button, { whileTap: { scale: 0.82 }, onClick: onLogout, className: "flex-none flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-red-300/60 hover:text-red-300 transition-colors", children: [_jsx(LogOut, { size: 22 }), _jsx("span", { className: "text-[9px] font-black leading-none", children: "Salir" })] })] }) }));
};
// ============================================================================
// RECIPES VIEW - INTERFAZ ADMIN vs PANADERO - COLORES PANADERÍA
// ============================================================================
const RecipesView = ({ user, isMobile = true }) => {
    const state = useAppState();
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category: 'Panadería',
        ingredients: [],
        temperature: 180,
        time: 30,
    });
    // Roles: superadmin/admin = gestión completa | baker = CRUD recetas + ver inventario | readonly/personal = solo ver
    const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
    const isBaker = user?.role === 'baker';
    const canEdit = isAdmin || isBaker;
    useEffect(() => {
        let filtered = state.recipes;
        if (category !== 'all') {
            filtered = filtered.filter((r) => r.category === category);
        }
        if (search) {
            filtered = filtered.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
        }
        // Personal ve todas las recetas (no sólo las suyas)
        setRecipes(filtered);
    }, [state.recipes, search, category, user]);
    const handleSaveRecipe = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.ingredients?.length) {
            alert('❌ Completa: nombre e ingredientes');
            return;
        }
        if (editingId) {
            const existingRecipe = state.recipes.find((r) => r.id === editingId);
            state.updateRecipe(editingId, {
                id: editingId,
                name: formData.name,
                category: formData.category || 'Panadería',
                ingredients: formData.ingredients,
                temperature: formData.temperature || 180,
                time: formData.time || 30,
                instructions: formData.instructions || '',
                createdBy: existingRecipe?.createdBy || user?.username || '',
                createdAt: existingRecipe?.createdAt || new Date().toISOString(),
            });
            setEditingId(null);
        }
        else {
            const newRecipe = {
                id: Date.now().toString() + Math.random(),
                name: formData.name,
                category: formData.category || 'Panadería',
                ingredients: formData.ingredients,
                temperature: formData.temperature || 180,
                time: formData.time || 30,
                instructions: formData.instructions || '',
                createdBy: user?.username || '',
                createdAt: new Date().toISOString(),
            };
            state.addRecipe(newRecipe);
        }
        setFormData({
            category: 'Panadería',
            ingredients: [],
            temperature: 180,
            time: 30,
        });
        setShowForm(false);
    };
    const handleEdit = (recipe) => {
        setEditingId(recipe.id);
        setFormData(recipe);
        setShowForm(true);
    };
    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta receta?')) {
            state.deleteRecipe(id);
        }
    };
    const addIngredient = () => {
        const ingredients = formData.ingredients || [];
        ingredients.push({
            id: Math.random().toString(),
            name: '',
            quantity: 0,
            unit: 'g',
        });
        setFormData({ ...formData, ingredients });
    };
    const updateIngredient = (id, field, value) => {
        const ingredients = (formData.ingredients || []).map((ing) => ing.id === id ? { ...ing, [field]: value } : ing);
        setFormData({ ...formData, ingredients });
    };
    const removeIngredient = (id) => {
        const ingredients = (formData.ingredients || []).filter((ing) => ing.id !== id);
        setFormData({ ...formData, ingredients });
    };
    // ============================================================================
    // MODO EDICIÓN (admin, superadmin, baker) — CRUD completo de recetas
    // ============================================================================
    if (canEdit) {
        return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "sticky top-0 bg-gradient-to-b from-amber-900 via-amber-800/95 to-amber-700/80 dark:from-amber-950 dark:via-amber-900/95 dark:to-amber-800/80 z-10 pt-4 pb-3 space-y-3 -mx-3 px-3 rounded-b-3xl shadow-xl", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(motion.div, { animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 3, repeat: Infinity }, className: "text-3xl", children: isBaker ? '👨‍🍳' : '👨‍⚖️' }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-black text-amber-100 opacity-80", children: isBaker ? 'MODO PANADERO' : 'MODO ADMINISTRADOR' }), _jsx("h2", { className: "text-xl font-black text-amber-50 font-playfair", children: "Gesti\u00F3n de Recetas" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(motion.input, { whileFocus: { scale: 1.05 }, type: "text", placeholder: "\uD83D\uDD0D Buscar receta...", value: search, onChange: (e) => setSearch(e.target.value), className: "flex-1 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 text-lg font-bold text-amber-900 dark:text-amber-100 placeholder-amber-600 dark:placeholder-amber-300 shadow-md focus:shadow-lg transition-all" }), _jsx(motion.button, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.85 }, onClick: () => {
                                        setEditingId(null);
                                        setFormData({
                                            category: 'Panadería',
                                            ingredients: [],
                                            temperature: 180,
                                            time: 30,
                                        });
                                        setShowForm(!showForm);
                                    }, className: "bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-50 p-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-xl", children: _jsx(Plus, { size: 28 }) })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 scrollbar-hide", children: ['all', 'Panadería', 'Pastelería'].map((cat, idx) => (_jsx(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 }, whileHover: { scale: 1.08 }, whileTap: { scale: 0.92 }, onClick: () => setCategory(cat), className: `px-5 py-2 rounded-full text-sm font-black whitespace-nowrap transition-all duration-300 ${category === cat
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-50 shadow-lg border-2 border-amber-300'
                                    : 'bg-amber-200/40 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-2 border-amber-300/50 dark:border-amber-700/50 hover:bg-amber-200/60 dark:hover:bg-amber-900/60'}`, children: cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel' }, cat))) })] }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "bg-gradient-to-br from-amber-100/50 to-amber-50/50 dark:from-amber-900/50 dark:to-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-6 shadow-xl", children: _jsxs("form", { onSubmit: handleSaveRecipe, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-black mb-2 block text-amber-900 dark:text-amber-100", children: "\uD83D\uDCDD NOMBRE DE RECETA" }), _jsx(motion.input, { whileFocus: { scale: 1.02 }, type: "text", value: formData.name || '', onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 text-lg font-bold transition-all" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-black mb-2 block text-amber-900 dark:text-amber-100", children: "\uD83D\uDCC2 CATEGOR\u00CDA" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full px-4 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 font-bold", children: [_jsx("option", { children: "Panader\u00EDa" }), _jsx("option", { children: "Pasteler\u00EDa" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-black mb-2 block text-amber-900 dark:text-amber-100", children: "\uD83C\uDF21\uFE0F TEMPERATURA" }), _jsx(motion.input, { whileFocus: { scale: 1.02 }, type: "number", value: formData.temperature || 180, onChange: (e) => setFormData({ ...formData, temperature: Number(e.target.value) }), className: "w-full px-4 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 font-bold transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-black mb-2 block text-amber-900 dark:text-amber-100", children: "\u23F1\uFE0F TIEMPO (minutos)" }), _jsx(motion.input, { whileFocus: { scale: 1.02 }, type: "number", value: formData.time || 30, onChange: (e) => setFormData({ ...formData, time: Number(e.target.value) }), className: "w-full px-4 py-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 font-bold transition-all" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("label", { className: "text-xs font-black text-amber-900 dark:text-amber-100", children: "\uD83E\uDD44 INGREDIENTES" }), _jsx(motion.button, { whileTap: { scale: 0.9 }, type: "button", onClick: addIngredient, className: "text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 text-xs font-black bg-amber-300/40 dark:bg-amber-700/40 px-3 py-1 rounded-lg transition-all border border-amber-300 dark:border-amber-700", children: "+ A\u00D1ADIR" })] }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: (formData.ingredients || []).map((ing) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Ingrediente", value: ing.name, onChange: (e) => updateIngredient(ing.id, 'name', e.target.value), className: "flex-1 px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 text-sm font-bold transition-all" }), _jsx("input", { type: "number", placeholder: "Qty", step: "0.1", value: ing.quantity, onChange: (e) => updateIngredient(ing.id, 'quantity', Number(e.target.value)), className: "w-20 px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 text-sm font-bold transition-all" }), _jsxs("select", { value: ing.unit, onChange: (e) => updateIngredient(ing.id, 'unit', e.target.value), className: "px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-amber-50 dark:bg-amber-900/50 dark:text-amber-100 text-sm font-bold transition-all", children: [_jsx("option", { children: "g" }), _jsx("option", { children: "kg" }), _jsx("option", { children: "ml" }), _jsx("option", { children: "L" }), _jsx("option", { children: "unid" })] }), _jsx(motion.button, { whileTap: { scale: 0.8 }, type: "button", onClick: () => removeIngredient(ing.id), className: "bg-red-500/30 hover:bg-red-500/50 text-red-700 dark:text-red-400 p-2 rounded-lg transition-all hover:shadow-lg", children: _jsx(Trash2, { size: 16 }) })] }, ing.id))) })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsxs(motion.button, { whileTap: { scale: 0.92 }, whileHover: { scale: 1.05 }, type: "submit", className: "flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-black transition-all text-lg shadow-md hover:shadow-lg", children: ["\u2705 ", editingId ? 'ACTUALIZAR' : 'CREAR RECETA'] }), _jsx(motion.button, { whileTap: { scale: 0.92 }, type: "button", onClick: () => {
                                                setShowForm(false);
                                                setEditingId(null);
                                            }, className: "flex-1 bg-amber-300/40 dark:bg-amber-700/40 hover:bg-amber-400/50 dark:hover:bg-amber-600/50 text-amber-900 dark:text-amber-100 px-4 py-3 rounded-xl font-black transition-all text-lg border-2 border-amber-300 dark:border-amber-700", children: "\u2715 CANCELAR" })] })] }) })) }), _jsx("div", { className: `${isMobile ? 'grid gap-3' : 'grid grid-cols-2 lg:grid-cols-3 gap-6'}`, children: recipes.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "text-center py-16", children: [_jsx(motion.div, { animate: { y: [0, -20, 0], rotate: [0, 5, -5, 0] }, transition: { duration: 2, repeat: Infinity }, className: "text-6xl mb-4", children: "\uD83D\uDCD6" }), _jsx("p", { className: "font-black text-lg text-amber-900 dark:text-amber-100", children: "No hay recetas a\u00FAn" }), _jsx("p", { className: "text-xs opacity-70", children: search || category !== 'all' ? 'Intenta con otro filtro' : 'Crea tu primera receta' })] })) : (recipes.map((recipe, idx) => (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { delay: idx * 0.05 }, whileHover: { y: -5, boxShadow: '0 20px 40px rgba(180, 83, 9, 0.2)' }, className: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/80 dark:to-amber-950 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-6 hover:shadow-xl transition-all cursor-pointer active:scale-95 group", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-2xl font-black font-playfair text-amber-900 dark:text-amber-100 mb-2", children: recipe.name }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs("span", { className: "px-3 py-1 bg-gradient-to-r from-orange-400/40 to-amber-400/40 text-amber-900 dark:text-amber-100 text-xs rounded-full font-black border border-amber-300 dark:border-amber-700", children: [recipe.category === 'Panadería' ? '🍞' : '🎂', " ", recipe.category] }), _jsxs("span", { className: "px-3 py-1 bg-amber-200/40 dark:bg-amber-800/40 text-amber-900 dark:text-amber-100 text-xs rounded-full font-black border border-amber-300 dark:border-amber-700", children: ["\uD83D\uDC68\u200D\uD83C\uDF73 ", recipe.createdBy] })] })] }), _jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-all", children: [_jsx(motion.button, { whileTap: { scale: 0.8 }, onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleEdit(recipe);
                                                }, className: "bg-blue-500/40 hover:bg-blue-500/60 text-blue-700 dark:text-blue-300 p-3 rounded-lg transition-all hover:shadow-lg", children: _jsx(Edit2, { size: 20 }) }), _jsx(motion.button, { whileTap: { scale: 0.8 }, onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleDelete(recipe.id);
                                                }, className: "bg-red-500/40 hover:bg-red-500/60 text-red-700 dark:text-red-300 p-3 rounded-lg transition-all hover:shadow-lg", children: _jsx(Trash2, { size: 20 }) })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-orange-200/60 to-orange-100/40 dark:from-orange-900/40 dark:to-orange-900/20 p-3 rounded-xl border-2 border-orange-300 dark:border-orange-700", children: [_jsx("p", { className: "opacity-70 text-xs font-black text-orange-900 dark:text-orange-200", children: "\uD83E\uDD44 ING" }), _jsx("p", { className: "font-black text-lg text-orange-800 dark:text-orange-300", children: recipe.ingredients.length })] }), _jsxs("div", { className: "bg-gradient-to-br from-red-200/60 to-red-100/40 dark:from-red-900/40 dark:to-red-900/20 p-3 rounded-xl border-2 border-red-300 dark:border-red-700", children: [_jsx("p", { className: "opacity-70 text-xs font-black text-red-900 dark:text-red-200", children: "\uD83C\uDF21\uFE0F T" }), _jsxs("p", { className: "font-black text-lg text-red-800 dark:text-red-300", children: [recipe.temperature, "\u00B0"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-amber-200/60 to-amber-100/40 dark:from-amber-900/40 dark:to-amber-900/20 p-3 rounded-xl border-2 border-amber-300 dark:border-amber-700", children: [_jsx("p", { className: "opacity-70 text-xs font-black text-amber-900 dark:text-amber-200", children: "\u23F1\uFE0F T" }), _jsxs("p", { className: "font-black text-lg text-amber-800 dark:text-amber-300", children: [recipe.time, "m"] })] })] }), _jsx("p", { className: "text-xs text-amber-800 dark:text-amber-300 line-clamp-2 font-semibold opacity-80", children: recipe.ingredients.map(ing => `${ing.name}`).join(' • ') })] }, recipe.id)))) })] }));
    }
    // MODO LECTURA — readonly y personal: ver recetas, sin editar
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "sticky top-0 bg-gradient-to-b from-purple-900 via-purple-800/95 to-purple-700/80 dark:from-purple-950 dark:via-purple-900/95 dark:to-purple-800/80 z-10 pt-4 pb-3 space-y-3 -mx-3 px-3 rounded-b-3xl shadow-xl", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(motion.div, { animate: { y: [0, -5, 0] }, transition: { duration: 2, repeat: Infinity }, className: "text-3xl", children: user?.role === 'readonly' ? '👨‍👩‍👧' : '🏭' }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-black text-purple-100 opacity-80", children: user?.role === 'readonly' ? 'MODO FAMILIA' : 'MODO PERSONAL' }), _jsx("h2", { className: "text-xl font-black text-purple-50 font-playfair", children: "Recetas" })] }), _jsx("span", { className: "ml-auto text-xs bg-white/20 text-white/80 font-black px-3 py-1 rounded-full border border-white/30", children: "\uD83D\uDC41\uFE0F Solo lectura" })] }), _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Buscar receta...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full px-5 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700 text-base font-bold text-purple-900 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-all" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: ['all', 'Panadería', 'Pastelería'].map((cat) => (_jsx("button", { onClick: () => setCategory(cat), className: `px-4 py-1.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${category === cat
                                ? 'bg-purple-400 text-white shadow-md'
                                : 'bg-purple-200/40 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100'}`, children: cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel' }, cat))) })] }), _jsx("div", { className: `${isMobile ? 'grid gap-3' : 'grid grid-cols-2 lg:grid-cols-3 gap-6'}`, children: recipes.length === 0 ? (_jsxs("div", { className: "col-span-full text-center py-16", children: [_jsx("p", { className: "text-4xl mb-3", children: "\uD83D\uDD0D" }), _jsx("p", { className: "font-black text-lg", children: "Sin resultados" })] })) : (recipes.map((recipe, idx) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, transition: { delay: idx * 0.05 }, whileHover: { x: 4, boxShadow: '0 12px 28px rgba(109,40,217,0.12)' }, className: "bg-gradient-to-br from-purple-50 to-amber-50/60 dark:from-purple-900/40 dark:to-amber-950/60 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-5 transition-all", children: [_jsx("h3", { className: "text-xl font-black font-playfair text-purple-900 dark:text-purple-100 mb-2", children: recipe.name }), _jsxs("span", { className: "px-3 py-1 bg-amber-300/40 text-amber-900 dark:text-amber-200 text-xs rounded-full font-black border border-amber-300/50 inline-block mb-3", children: [recipe.category === 'Panadería' ? '🍞' : '🎂', " ", recipe.category] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3", children: [_jsxs("div", { className: "bg-orange-100/60 dark:bg-orange-900/30 p-2 rounded-xl text-center border border-orange-200 dark:border-orange-800", children: [_jsx("p", { className: "text-[10px] font-black opacity-60", children: "\uD83C\uDF21\uFE0F TEMP" }), _jsxs("p", { className: "font-black text-lg text-orange-800 dark:text-orange-300", children: [recipe.temperature, "\u00B0"] })] }), _jsxs("div", { className: "bg-amber-100/60 dark:bg-amber-900/30 p-2 rounded-xl text-center border border-amber-200 dark:border-amber-800", children: [_jsx("p", { className: "text-[10px] font-black opacity-60", children: "\u23F1\uFE0F TIEMPO" }), _jsxs("p", { className: "font-black text-lg text-amber-800 dark:text-amber-300", children: [recipe.time, "m"] })] })] }), _jsxs("div", { className: "bg-white/50 dark:bg-gray-800/40 rounded-2xl p-3 max-h-48 overflow-y-auto border border-purple-100 dark:border-purple-900", children: [_jsxs("p", { className: "text-[10px] font-black opacity-60 mb-1", children: ["\uD83E\uDD44 INGREDIENTES (", recipe.ingredients.length, ")"] }), recipe.ingredients.map((ing) => (_jsxs("p", { className: "text-sm font-bold text-purple-800 dark:text-purple-200", children: ["\u2022 ", ing.name, " ", _jsxs("span", { className: "text-xs opacity-60", children: [ing.quantity, ing.unit] })] }, ing.id)))] })] }, recipe.id)))) })] }));
};
// ============================================================================
// CALCULATOR VIEW
// ============================================================================
const CalculatorView = () => {
    const state = useAppState();
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [scaleType, setScaleType] = useState('quantity');
    const [baseIngredientId, setBaseIngredientId] = useState(null);
    const [baseValue, setBaseValue] = useState(0);
    const [productQuantity, setProductQuantity] = useState(1);
    const [scaledRecipe, setScaledRecipe] = useState(null);
    const [scale, setScale] = useState(1);
    const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);
    const calculateTotalMass = (recipe) => {
        return recipe.ingredients.reduce((sum, ing) => {
            const value = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
            return sum + value;
        }, 0);
    };
    const handleScale = () => {
        if (!selectedRecipe)
            return;
        let calculatedScale = 1;
        if (scaleType === 'ingredient' && baseIngredientId && baseValue > 0) {
            const baseIng = selectedRecipe.ingredients.find((i) => i.id === baseIngredientId);
            if (!baseIng)
                return;
            const baseInG = baseIng.unit === 'kg' || baseIng.unit === 'L' ? baseIng.quantity * 1000 : baseIng.quantity;
            calculatedScale = baseValue / baseInG;
        }
        else if (scaleType === 'quantity' && productQuantity > 0) {
            calculatedScale = productQuantity;
        }
        const scaled = {
            ...selectedRecipe,
            ingredients: selectedRecipe.ingredients.map((ing) => ({
                ...ing,
                quantity: ing.quantity * calculatedScale,
            })),
        };
        setScale(calculatedScale);
        setScaledRecipe(scaled);
    };
    const exportImage = async () => {
        if (!scaledRecipe)
            return;
        const element = document.getElementById('recipe-export');
        if (!element)
            return;
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#FDFBF7',
                scale: 2,
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${scaledRecipe.name}-escalada.png`;
            link.click();
        }
        catch (error) {
            console.error('Error:', error);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-lg font-black", children: "\uD83D\uDCD6 SELECCIONA UNA RECETA" }), _jsxs("select", { value: selectedRecipeId || '', onChange: (e) => {
                            setSelectedRecipeId(e.target.value);
                            setScaledRecipe(null);
                            setProductQuantity(1);
                        }, className: "w-full px-4 py-3 rounded-2xl border-2 border-secondary/30 focus:border-secondary bg-white dark:bg-gray-800 dark:border-gray-700 text-lg font-bold", children: [_jsx("option", { value: "", children: "-- Elige una receta --" }), state.recipes.map((r) => (_jsx("option", { value: r.id, children: r.name }, r.id)))] })] }), selectedRecipe && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: () => setScaleType('quantity'), className: `p-3 rounded-2xl font-black transition text-lg ${scaleType === 'quantity'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-800 text-primary dark:text-gray-200'}`, children: "\uD83C\uDF5E Unidades" }), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: () => setScaleType('ingredient'), className: `p-3 rounded-2xl font-black transition text-lg ${scaleType === 'ingredient'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-800 text-primary dark:text-gray-200'}`, children: "\uD83E\uDD44 Ingrediente" })] }), scaleType === 'ingredient' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-bold mb-2 block", children: "\uD83E\uDD44 Ingrediente base" }), _jsxs("select", { value: baseIngredientId || '', onChange: (e) => setBaseIngredientId(e.target.value), className: "w-full px-4 py-3 rounded-2xl border-2 border-secondary/30 focus:border-secondary bg-white dark:bg-gray-800 dark:border-gray-700 text-lg font-bold mb-3", children: [_jsx("option", { value: "", children: "-- Selecciona --" }), selectedRecipe.ingredients.map((ing) => (_jsxs("option", { value: ing.id, children: [ing.name, " (", ing.quantity, ing.unit, ")"] }, ing.id)))] })] }), baseIngredientId && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-bold mb-2 block", children: "\uD83C\uDFAF Cantidad nueva" }), _jsx("input", { type: "number", placeholder: "Ej: 500", value: baseValue || '', onChange: (e) => setBaseValue(Number(e.target.value)), className: "w-full px-4 py-3 rounded-2xl border-2 border-secondary/30 focus:border-secondary bg-white dark:bg-gray-800 dark:border-gray-700 text-lg font-bold" })] }))] })), scaleType === 'quantity' && (_jsxs("div", { children: [_jsxs("label", { className: "text-sm font-bold mb-2 block", children: ["\uD83C\uDF5E \u00BFCU\u00C1NTOS ", selectedRecipe.category === 'Panadería' ? 'PANES' : 'PASTELES', " QUIERES HACER?"] }), _jsx("input", { type: "number", min: "1", step: "1", placeholder: "Ej: 5", value: productQuantity || 1, onChange: (e) => setProductQuantity(Math.max(1, Number(e.target.value))), className: "w-full px-4 py-3 rounded-2xl border-2 border-secondary/30 focus:border-secondary bg-white dark:bg-gray-800 dark:border-gray-700 text-lg font-bold" }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["\uD83D\uDCCF Masa para 1: ", calculateTotalMass(selectedRecipe).toFixed(0), " g | Para ", productQuantity, ": ", (calculateTotalMass(selectedRecipe) * productQuantity).toFixed(0), " g"] })] })), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: handleScale, className: "w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-2xl font-black transition disabled:opacity-50 text-lg shadow-lg", children: "\u26A1 ESCALAR RECETA" })] })), scaledRecipe && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, id: "recipe-export", className: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-gray-900 dark:to-gray-950 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("h2", { className: "text-2xl font-black font-playfair", children: scaledRecipe.name }), _jsxs("p", { className: "text-sm font-bold text-orange-700 dark:text-orange-400", children: ["\uD83D\uDD22 ", scaleType === 'quantity' ? `${productQuantity} UNIDADES` : `Escalada ${scale.toFixed(2)}x`] })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [_jsx("h3", { className: "font-black text-lg", children: "\uD83E\uDD44 INGREDIENTES:" }), scaledRecipe.ingredients.map((ing) => (_jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-orange-200 dark:border-orange-800", children: [_jsx("span", { className: "font-bold", children: ing.name }), _jsxs("span", { className: "font-mono font-black text-lg text-orange-700 dark:text-orange-400", children: [ing.quantity.toFixed(2), " ", ing.unit] })] }, ing.id))), _jsx("div", { className: "bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border-2 border-orange-300 dark:border-orange-700 mt-4", children: _jsxs("p", { className: "font-black text-orange-800 dark:text-orange-200", children: ["\uD83D\uDCCF MASA TOTAL: ", (calculateTotalMass(scaledRecipe)).toFixed(0), " g"] }) })] }), _jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: exportImage, className: "w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-2xl font-black transition flex items-center justify-center gap-2 text-lg shadow-lg", children: [_jsx(Download, { size: 20 }), "\uD83D\uDCE5 DESCARGAR PNG"] })] }))] }));
};
// ============================================================================
// INVENTORY VIEW
// ============================================================================
const InventoryView = () => {
    const state = useAppState();
    const user = state.user;
    const canEdit = PERMS.canEditInventory(user.role);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'kg',
    });
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };
    const calculateCostPer = (op) => {
        const totalGrams = op.type === 'kg'
            ? op.presentationWeight * op.unitsPurchased * 1000
            : op.type === 'L'
                ? op.presentationWeight * op.unitsPurchased * 1000
                : op.presentationWeight * op.unitsPurchased;
        return {
            perGram: op.totalCost / totalGrams,
            per100g: (op.totalCost / totalGrams) * 100,
            perKg: (op.totalCost / totalGrams) * 1000,
        };
    };
    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.type || !formData.presentationWeight || !formData.unitsPurchased || !formData.totalCost) {
            alert('❌ Completa todos los campos');
            return;
        }
        if (editingId) {
            state.updateOperation(editingId, {
                id: editingId,
                ...formData,
            });
            setEditingId(null);
        }
        else {
            state.addOperation({
                id: Date.now().toString() + Math.random(),
                ...formData,
            });
        }
        setFormData({ type: 'kg' });
        setShowForm(false);
    };
    const handleEdit = (op) => {
        setEditingId(op.id);
        setFormData(op);
        setShowForm(true);
    };
    const handleDelete = (id) => {
        if (confirm('¿Eliminar este insumo?')) {
            state.deleteOperation(id);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [canEdit && (_jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: () => {
                    setEditingId(null);
                    setFormData({ type: 'kg' });
                    setShowForm(!showForm);
                }, className: "w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 text-lg", children: [_jsx(Plus, { size: 24 }), "\u2795 NUEVO INSUMO"] })), !canEdit && (_jsxs("div", { className: "flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC41\uFE0F" }), _jsxs("div", { children: [_jsx("p", { className: "font-black text-blue-800 dark:text-blue-200 text-sm", children: "Vista de Inventario" }), _jsx("p", { className: "text-xs text-blue-600 dark:text-blue-400", children: "Puedes consultar los insumos y sus costos" })] })] })), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-4", children: _jsxs("form", { onSubmit: handleSave, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold mb-1 block", children: "\uD83D\uDCDD Nombre" }), _jsx("input", { type: "text", value: formData.name || '', onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700 text-lg font-bold", placeholder: "Ej: Harina Premium" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold mb-1 block", children: "\uD83D\uDCCA Tipo" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700 text-lg font-bold", children: [_jsx("option", { value: "kg", children: "kg" }), _jsx("option", { value: "L", children: "L" }), _jsx("option", { value: "unid", children: "Unidad" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold mb-1 block", children: "\u2696\uFE0F Peso/Presentaci\u00F3n" }), _jsx("input", { type: "number", step: "0.1", value: formData.presentationWeight || '', onChange: (e) => setFormData({ ...formData, presentationWeight: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700 text-lg font-bold", placeholder: "1" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold mb-1 block", children: "\uD83D\uDCE6 Unidades" }), _jsx("input", { type: "number", value: formData.unitsPurchased || '', onChange: (e) => setFormData({ ...formData, unitsPurchased: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700 text-lg font-bold", placeholder: "10" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold mb-1 block", children: "\uD83D\uDCB0 Costo Total" }), _jsx("input", { type: "number", step: "100", value: formData.totalCost || '', onChange: (e) => setFormData({ ...formData, totalCost: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700 text-lg font-bold", placeholder: "100000" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(motion.button, { whileTap: { scale: 0.95 }, type: "submit", className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition text-lg", children: ["\u2705 ", editingId ? 'ACTUALIZAR' : 'CREAR'] }), _jsx(motion.button, { whileTap: { scale: 0.95 }, type: "button", onClick: () => {
                                            setShowForm(false);
                                            setEditingId(null);
                                        }, className: "flex-1 bg-gray-400/20 hover:bg-gray-400/40 text-primary dark:text-gray-200 px-4 py-2 rounded-xl font-bold transition text-lg", children: "\u2715 CANCELAR" })] })] }) })) }), _jsx("div", { className: "space-y-3", children: state.operations.length === 0 ? (_jsxs(motion.div, { className: "text-center py-12 text-gray-500", children: [_jsx("div", { className: "text-6xl mb-3", children: "\uD83D\uDED2" }), _jsx("p", { className: "font-bold", children: "Inventario vac\u00EDo" }), _jsx("p", { className: "text-xs opacity-70", children: "Agrega insumos para gestionar costos" })] })) : (state.operations.map((op) => {
                    const costs = calculateCostPer(op);
                    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white dark:bg-gray-800 border-2 border-blue-300/30 dark:border-gray-700 rounded-2xl p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold", children: op.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [op.presentationWeight, op.type, " \u00D7 ", op.unitsPurchased] })] }), _jsx("div", { className: "flex gap-2", children: canEdit && (_jsxs(_Fragment, { children: [_jsx(motion.button, { whileTap: { scale: 0.9 }, onClick: () => handleEdit(op), className: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-600 p-2 rounded-lg transition", children: _jsx(Edit2, { size: 16 }) }), _jsx(motion.button, { whileTap: { scale: 0.9 }, onClick: () => handleDelete(op.id), className: "bg-red-500/20 hover:bg-red-500/40 text-red-600 p-2 rounded-lg transition", children: _jsx(Trash2, { size: 16 }) })] })) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg", children: [_jsx("p", { className: "text-blue-700 dark:text-blue-300 font-bold", children: "$ / g" }), _jsx("p", { className: "font-bold text-lg", children: formatCurrency(costs.perGram) })] }), _jsxs("div", { className: "bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg", children: [_jsx("p", { className: "text-blue-700 dark:text-blue-300 font-bold", children: "$ / 100g" }), _jsx("p", { className: "font-bold text-lg", children: formatCurrency(costs.per100g) })] }), _jsxs("div", { className: "bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg", children: [_jsx("p", { className: "text-blue-700 dark:text-blue-300 font-bold", children: "$ / kg" }), _jsx("p", { className: "font-bold text-lg", children: formatCurrency(costs.perKg) })] })] })] }, op.id));
                })) })] }));
};
// ============================================================================
// COSTS VIEW
// ============================================================================
const CostsView = () => {
    const state = useAppState();
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [margin, setMargin] = useState(40);
    const [scaledRecipe, setScaledRecipe] = useState(null);
    const [costs, setCosts] = useState(null);
    const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };
    const calculateCosts = () => {
        if (!selectedRecipe)
            return;
        const ingredientCosts = {};
        let totalCost = 0;
        selectedRecipe.ingredients.forEach((ing) => {
            const operation = state.operations.find((op) => op.name.toLowerCase() === ing.name.toLowerCase());
            if (operation) {
                const totalGrams = operation.type === 'kg'
                    ? operation.presentationWeight * operation.unitsPurchased * 1000
                    : operation.type === 'L'
                        ? operation.presentationWeight * operation.unitsPurchased * 1000
                        : operation.presentationWeight * operation.unitsPurchased;
                const costPerGram = operation.totalCost / totalGrams;
                const ingGrams = ing.unit === 'kg' || ing.unit === 'L'
                    ? ing.quantity * 1000
                    : ing.quantity;
                ingredientCosts[ing.name] = costPerGram * ingGrams;
                totalCost += ingredientCosts[ing.name];
            }
        });
        const suggestedPrice = totalCost * (1 + margin / 100);
        setCosts({
            ingredientCosts,
            totalCost,
            suggestedPrice,
            profit: suggestedPrice - totalCost,
        });
        setScaledRecipe(selectedRecipe);
    };
    const costDistribution = costs && selectedRecipe
        ? selectedRecipe.ingredients
            .map((ing) => ({
            name: ing.name,
            cost: costs.ingredientCosts[ing.name] || 0,
            percentage: costs.totalCost > 0 ? ((costs.ingredientCosts[ing.name] || 0) / costs.totalCost) * 100 : 0,
        }))
            .filter((c) => c.cost > 0)
        : [];
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-bold mb-2 block", children: "\uD83D\uDCD6 Selecciona receta" }), _jsxs("select", { value: selectedRecipeId || '', onChange: (e) => {
                            setSelectedRecipeId(e.target.value);
                            setCosts(null);
                        }, className: "w-full px-4 py-3 rounded-2xl border-2 border-secondary/30 focus:border-secondary bg-white dark:bg-gray-800 dark:border-gray-700 text-lg font-bold", children: [_jsx("option", { value: "", children: "-- Elige una receta --" }), state.recipes.map((r) => (_jsx("option", { value: r.id, children: r.name }, r.id)))] })] }), selectedRecipe && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("label", { className: "text-sm font-bold", children: "\uD83D\uDCB0 Margen Ganancia:" }), _jsxs("span", { className: "text-2xl font-bold text-secondary", children: [margin, "%"] })] }), _jsx("input", { type: "range", min: "0", max: "100", value: margin, onChange: (e) => setMargin(Number(e.target.value)), className: "w-full h-3 bg-secondary/20 rounded-lg appearance-none cursor-pointer" })] }), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: calculateCosts, className: "w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold transition text-lg", children: "\uD83D\uDCCA CALCULAR COSTOS" })] })), costs && scaledRecipe && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-red-700 dark:text-red-300 font-bold", children: "Costo Ingredientes" }), _jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: formatCurrency(costs.totalCost) })] }), _jsxs("div", { className: "bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-green-700 dark:text-green-300 font-bold", children: "Precio Sugerido" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: formatCurrency(costs.suggestedPrice) })] })] }), _jsxs("div", { className: "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-blue-700 dark:text-blue-300 font-bold", children: "\uD83D\uDCB0 Ganancia Estimada" }), _jsx("p", { className: "text-3xl font-bold text-blue-600 dark:text-blue-400", children: formatCurrency(costs.profit) })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 border-2 border-secondary/20 rounded-2xl p-4", children: [_jsx("h3", { className: "font-bold text-lg mb-3", children: "\uD83D\uDCCA Distribuci\u00F3n de Costos" }), _jsx("div", { className: "space-y-3", children: costDistribution.map((item) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "font-bold text-sm", children: item.name }), _jsxs("span", { className: "text-sm font-bold text-secondary", children: [item.percentage.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${item.percentage}%` }, className: "h-full bg-gradient-to-r from-secondary to-secondary/80", transition: { duration: 0.6, ease: 'easeOut' } }) })] }, item.name))) })] })] }))] }));
};
// ============================================================================
// HOOK RESPONSIVE
// ============================================================================
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(true);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};
// ============================================================================
// DESKTOP NAVBAR SIDEBAR
// ============================================================================
const DesktopSidebar = ({ user, currentView, onViewChange, onLogout }) => {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: '🏠', activeColor: 'from-purple-500 to-purple-600', border: 'border-purple-400' },
        { id: 'recipes', label: 'Recetas', icon: '📖', activeColor: 'from-orange-500 to-orange-600', border: 'border-orange-400' },
        ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calculadora', icon: '🧮', activeColor: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400' }] : []),
        ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory', label: 'Inventario', icon: '🛒', activeColor: 'from-blue-500 to-blue-600', border: 'border-blue-400' }] : []),
        ...(PERMS.canViewCosts(user.role) ? [{ id: 'costs', label: 'Costos', icon: '💰', activeColor: 'from-green-500 to-green-600', border: 'border-green-400' }] : []),
    ];
    const roleInfo = ROLE_INFO[user.role];
    const initials = user.username.slice(0, 2).toUpperCase();
    return (_jsxs(motion.div, { initial: { x: -300 }, animate: { x: 0 }, className: "fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-primary via-primary/97 to-primary/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-r-2 border-secondary/30 shadow-2xl z-50 flex flex-col", children: [_jsx("div", { className: "px-6 pt-6 pb-4 border-b border-white/10", children: _jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx(motion.span, { animate: { rotate: [0, 360] }, transition: { duration: 10, repeat: Infinity, ease: 'linear' }, className: "text-3xl", children: "\uD83C\uDF5E" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-black font-playfair text-cream leading-none", children: "CALIPAN VIRREY" }), _jsx("p", { className: "text-[10px] text-secondary/70 font-bold tracking-widest", children: "PANADER\u00CDA PREMIUM" })] })] }) }), _jsxs("div", { className: "px-4 py-3 mx-3 mt-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center gap-3", children: [_jsx("div", { className: "w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-cream text-sm font-black shadow-lg flex-shrink-0", children: initials }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-cream font-black text-sm truncate", children: user.username }), _jsxs("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${roleInfo.badge}`, children: [roleInfo.emoji, " ", roleInfo.label] })] })] }), _jsxs("nav", { className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto", children: [_jsx("p", { className: "text-cream/30 text-[10px] font-black tracking-widest uppercase px-3 mb-2", children: "Navegaci\u00F3n" }), navItems.map((item, idx) => {
                        const active = currentView === item.id;
                        return (_jsxs(motion.button, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.07 }, whileHover: { x: active ? 0 : 6 }, whileTap: { scale: 0.96 }, onClick: () => onViewChange(item.id), className: `w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${active
                                ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg border-l-4 ${item.border}`
                                : 'text-cream/60 hover:text-cream hover:bg-white/10 border-l-4 border-transparent'}`, children: [active && (_jsx(motion.div, { layoutId: "sidebar-active", className: "absolute inset-0 bg-white/10 rounded-xl pointer-events-none", transition: { type: 'spring', stiffness: 400, damping: 30 } })), _jsx("span", { className: "text-xl relative z-10", children: item.icon }), _jsx("span", { className: "font-black text-sm relative z-10", children: item.label }), active && _jsx(motion.div, { animate: { scale: [1, 1.5, 1] }, transition: { duration: 1.5, repeat: Infinity }, className: "ml-auto w-2 h-2 bg-white/70 rounded-full relative z-10" })] }, item.id));
                    })] }), _jsxs("div", { className: "px-3 pb-4 border-t border-white/10 pt-3 space-y-2", children: [_jsxs(motion.button, { whileHover: { scale: 1.03 }, whileTap: { scale: 0.95 }, onClick: onLogout, className: "w-full bg-red-500/20 hover:bg-red-500/40 text-red-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-sm transition-all border border-red-500/30", children: [_jsx(LogOut, { size: 18 }), "CERRAR SESI\u00D3N"] }), _jsx("p", { className: "text-center text-cream/20 text-[10px] font-bold", children: "v2.0.0 \u00B7 BakeControl \u00A9 2025" })] })] }));
};
// ============================================================================
// MAIN APP
// ============================================================================
const App = () => {
    const state = useAppState();
    const [currentView, setCurrentView] = useState('home');
    const isMobile = useIsMobile();
    const renderView = () => {
        switch (currentView) {
            case 'home':
                return (_jsx(HomePage, { user: state.user, stats: {
                        recipes: state.recipes.length,
                        inventory: state.operations.length,
                    }, onNavigate: setCurrentView }));
            case 'recipes':
                return _jsx(RecipesView, { user: state.user, isMobile: isMobile });
            case 'calculator':
                return _jsx(CalculatorView, {});
            case 'inventory':
                return _jsx(InventoryView, {});
            case 'costs':
                return _jsx(CostsView, {});
            default:
                return (_jsx(HomePage, { user: state.user, stats: {
                        recipes: state.recipes.length,
                        inventory: state.operations.length,
                    }, onNavigate: setCurrentView }));
        }
    };
    if (!state.user) {
        return _jsx(LoginPage, { onLogin: (user, remember) => {
                state.setUser(user);
                if (remember)
                    state.setRememberMe(true);
            } });
    }
    return (_jsxs("div", { className: "min-h-screen bg-cream dark:bg-gray-950", children: [!isMobile && (_jsxs(_Fragment, { children: [_jsx(DesktopSidebar, { user: state.user, currentView: currentView, onViewChange: setCurrentView, onLogout: () => {
                            state.setUser(null);
                            localStorage.removeItem('calipan-remember');
                        } }), _jsxs("header", { className: "fixed top-0 left-72 right-0 h-14 bg-cream/80 dark:bg-gray-950/80 backdrop-blur border-b border-black/10 flex items-center px-8 z-40", children: [_jsx("div", { className: "flex items-center gap-2 text-primary dark:text-cream font-black text-sm", children: ['home', 'recipes', 'calculator', 'inventory', 'costs'].includes(currentView) && (_jsx("span", { className: "capitalize", children: currentView === 'home' ? '🏠 Inicio' : currentView === 'recipes' ? '📖 Recetas' : currentView === 'calculator' ? '🧮 Calculadora' : currentView === 'inventory' ? '🛒 Inventario' : '💰 Costos' })) }), _jsxs("div", { className: "ml-auto text-xs text-primary/40 dark:text-cream/30 font-bold", children: ["CALIPAN VIRREY \u00B7 ", new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'short' })] })] }), _jsx("main", { className: "ml-72 pt-14 p-8", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, className: "max-w-6xl mx-auto", children: renderView() }, currentView) })] })), isMobile && (_jsxs(_Fragment, { children: [_jsx("main", { className: "w-full px-4 py-4 pb-24", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, children: renderView() }, currentView) }), _jsx(MobileNavbar, { user: state.user, currentView: currentView, onViewChange: setCurrentView, onLogout: () => {
                            state.setUser(null);
                            localStorage.removeItem('calipan-remember');
                        } })] }))] }));
};
// ============================================================================
// RENDER
// ============================================================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));
