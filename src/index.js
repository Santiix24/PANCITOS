import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ShoppingCart, BookOpen, Edit2, Trash2, Eye, EyeOff, Download, Zap, TrendingUp, Sun, Moon, } from 'lucide-react';
import html2canvas from 'html2canvas';
// Matriz de permisos centralizada
const PERMS = {
    canEditRecipes: (r) => ['superadmin', 'admin', 'baker'].includes(r),
    canUseCalculator: (r) => ['superadmin', 'admin', 'baker'].includes(r),
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
        // Harinas (precios Colombia - bulto 50kg promedio $120.000-$150.000)
        { id: '1', name: 'Harina de trigo', type: 'kg', presentationWeight: 50, unitsPurchased: 2, totalCost: 260000, stockQuantity: 100000 },
        { id: '2', name: 'Harina integral', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 145000, stockQuantity: 50000 },
        { id: '3', name: 'Harina de fuerza', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 180000, stockQuantity: 50000 },
        // Agua (muy económica)
        { id: '4', name: 'Agua', type: 'L', presentationWeight: 20, unitsPurchased: 5, totalCost: 8000, stockQuantity: 100000 },
        { id: '5', name: 'Agua tibia', type: 'L', presentationWeight: 20, unitsPurchased: 5, totalCost: 8000, stockQuantity: 100000 },
        // Sal (bulto 25kg ~$25.000)
        { id: '6', name: 'Sal', type: 'kg', presentationWeight: 25, unitsPurchased: 1, totalCost: 25000, stockQuantity: 25000 },
        // Levaduras
        { id: '7', name: 'Levadura fresca', type: 'kg', presentationWeight: 0.5, unitsPurchased: 10, totalCost: 85000, stockQuantity: 5000 },
        { id: '8', name: 'Levadura', type: 'kg', presentationWeight: 0.5, unitsPurchased: 10, totalCost: 85000, stockQuantity: 5000 },
        { id: '9', name: 'Levadura en polvo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
        // Lácteos (precios Colombia)
        { id: '10', name: 'Mantequilla', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 380000, stockQuantity: 10000 },
        { id: '11', name: 'Mantequilla derretida', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 190000, stockQuantity: 5000 },
        { id: '12', name: 'Leche', type: 'L', presentationWeight: 1, unitsPurchased: 50, totalCost: 175000, stockQuantity: 50000 },
        { id: '13', name: 'Leche tibia', type: 'L', presentationWeight: 1, unitsPurchased: 20, totalCost: 70000, stockQuantity: 20000 },
        { id: '14', name: 'Crema de leche', type: 'L', presentationWeight: 1, unitsPurchased: 10, totalCost: 85000, stockQuantity: 10000 },
        { id: '15', name: 'Crema para batir', type: 'L', presentationWeight: 1, unitsPurchased: 8, totalCost: 96000, stockQuantity: 8000 },
        { id: '16', name: 'Crema ácida', type: 'L', presentationWeight: 1, unitsPurchased: 5, totalCost: 55000, stockQuantity: 5000 },
        { id: '17', name: 'Queso crema', type: 'kg', presentationWeight: 1, unitsPurchased: 4, totalCost: 120000, stockQuantity: 4000 },
        { id: '18', name: 'Mascarpone', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 96000, stockQuantity: 2000 },
        { id: '19', name: 'Leche condensada', type: 'L', presentationWeight: 0.4, unitsPurchased: 20, totalCost: 180000, stockQuantity: 8000 },
        { id: '20', name: 'Leche evaporada', type: 'L', presentationWeight: 0.4, unitsPurchased: 15, totalCost: 105000, stockQuantity: 6000 },
        // Endulzantes
        { id: '21', name: 'Azúcar', type: 'kg', presentationWeight: 50, unitsPurchased: 1, totalCost: 145000, stockQuantity: 50000 },
        { id: '22', name: 'Miel', type: 'L', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 72000, stockQuantity: 2000 },
        // Huevos (cubeta 30 huevos ~$18.000-$22.000)
        { id: '23', name: 'Huevos', type: 'unid', presentationWeight: 1, unitsPurchased: 300, totalCost: 180000, stockQuantity: 300 },
        { id: '24', name: 'Huevo', type: 'unid', presentationWeight: 1, unitsPurchased: 120, totalCost: 72000, stockQuantity: 120 },
        { id: '25', name: 'Yemas de huevo', type: 'unid', presentationWeight: 1, unitsPurchased: 60, totalCost: 48000, stockQuantity: 60 },
        // Chocolate y cacao
        { id: '26', name: 'Cacao en polvo', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 135000, stockQuantity: 3000 },
        { id: '27', name: 'Chocolate negro', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 225000, stockQuantity: 5000 },
        // Especias y saborizantes
        { id: '28', name: 'Vainilla', type: 'L', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 48000, stockQuantity: 1000 },
        { id: '29', name: 'Canela molida', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 56000, stockQuantity: 1000 },
        { id: '30', name: 'Canela', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 56000, stockQuantity: 1000 },
        // Frutas y frutos secos
        { id: '31', name: 'Fresas frescas', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 80000, stockQuantity: 8000 },
        { id: '32', name: 'Manzanas verdes', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
        { id: '33', name: 'Manzanas', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
        { id: '34', name: 'Nueces', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 110000, stockQuantity: 2000 },
        { id: '35', name: 'Pasas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
        // Mermeladas y conservas
        { id: '36', name: 'Mermelada de fresa', type: 'L', presentationWeight: 1, unitsPurchased: 4, totalCost: 64000, stockQuantity: 4000 },
        { id: '37', name: 'Mermelada de albaricoque', type: 'L', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
        // Galletas y bases
        { id: '38', name: 'Galletas digestivas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 8, totalCost: 72000, stockQuantity: 4000 },
        { id: '39', name: 'Galletas de soletilla', type: 'kg', presentationWeight: 0.4, unitsPurchased: 6, totalCost: 54000, stockQuantity: 2400 },
        { id: '40', name: 'Pan francés', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
        // Aceites y grasas
        { id: '41', name: 'Aceite', type: 'L', presentationWeight: 3, unitsPurchased: 4, totalCost: 84000, stockQuantity: 12000 },
        // Polvo de hornear y otros
        { id: '42', name: 'Polvo de hornear', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 32000, stockQuantity: 2000 },
        // Café y bebidas
        { id: '43', name: 'Café molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 68000, stockQuantity: 2000 },
        { id: '44', name: 'Café espresso', type: 'L', presentationWeight: 1, unitsPurchased: 5, totalCost: 85000, stockQuantity: 5000 },
        { id: '45', name: 'Ron o Marsala', type: 'L', presentationWeight: 0.75, unitsPurchased: 2, totalCost: 90000, stockQuantity: 1500 },
        // Carnes y proteínas
        { id: '46', name: 'Carne molida', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 190000, stockQuantity: 10000 },
        // Vegetales y hierbas
        { id: '47', name: 'Cebolla', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 35000, stockQuantity: 10000 },
        { id: '48', name: 'Ajo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 28000, stockQuantity: 2000 },
        { id: '49', name: 'Ajo molido', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 24000, stockQuantity: 1000 },
        { id: '50', name: 'Perejil fresco', type: 'kg', presentationWeight: 0.1, unitsPurchased: 10, totalCost: 20000, stockQuantity: 1000 },
        { id: '51', name: 'Pimienta negra', type: 'kg', presentationWeight: 0.1, unitsPurchased: 5, totalCost: 25000, stockQuantity: 500 },
    ];
    const loadFromStorage = () => {
        try {
            const saved = localStorage.getItem('pancitos-state');
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
                else {
                    // Migrar operaciones que no tengan stockQuantity
                    parsed.operations = parsed.operations.map((op) => {
                        if (op.stockQuantity === undefined || op.stockQuantity === null) {
                            const calculatedStock = op.type === 'kg' || op.type === 'L'
                                ? op.presentationWeight * op.unitsPurchased * 1000
                                : op.presentationWeight * op.unitsPurchased;
                            return { ...op, stockQuantity: calculatedStock };
                        }
                        return op;
                    });
                }
                // Migrar defaultMargin si no existe
                if (parsed.defaultMargin === undefined || parsed.defaultMargin === null) {
                    parsed.defaultMargin = 40;
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
            defaultMargin: 40,
            setUser: () => { },
            addRecipe: () => { },
            updateRecipe: () => { },
            deleteRecipe: () => { },
            addOperation: () => { },
            updateOperation: () => { },
            deleteOperation: () => { },
            setRememberMe: () => { },
            setDefaultMargin: () => { },
        };
    };
    const saveToStorage = () => {
        try {
            const toSave = {
                user: state.user,
                recipes: state.recipes,
                operations: state.operations,
                rememberMe: state.rememberMe,
                defaultMargin: state.defaultMargin,
            };
            localStorage.setItem('pancitos-state', JSON.stringify(toSave));
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
        setDefaultMargin: (margin) => {
            state.defaultMargin = margin;
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
// HELPER: VERIFICAR DISPONIBILIDAD DE INGREDIENTES EN INVENTARIO
// ============================================================================
// Normaliza nombres para comparación (quita acentos, minúsculas, espacios extra)
const normalizeIngredientName = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};
// Verifica si un ingrediente está disponible en el inventario
const checkIngredientInInventory = (ingredientName, operations) => {
    const normalizedIngredient = normalizeIngredientName(ingredientName);
    const found = operations.find((op) => {
        const normalizedOp = normalizeIngredientName(op.name);
        // Busca coincidencia exacta o parcial
        return normalizedOp === normalizedIngredient ||
            normalizedOp.includes(normalizedIngredient) ||
            normalizedIngredient.includes(normalizedOp);
    });
    return {
        available: !!found,
        inventoryItem: found || null,
    };
};
// ============================================================================
// CREDENCIALES
// ============================================================================
const CREDENTIALS = {
    // 👑 Dueño: acceso completo a todo, incluye costos y gestión
    'Administrador': { password: 'Administrador2026', role: 'superadmin', label: 'Dueño / Super Admin', emoji: '👑' },
    // 👨‍🍳 Panadero jefe: CRUD recetas + calculadora + ver inventario (sin costos)
    'pancitos': { password: 'pancitos2026', role: 'baker', label: 'Panadero Jefe Pancitos', emoji: '👨‍🍳' },
};
const ROLE_INFO = {
    superadmin: { label: 'Dueño / Super Admin', badge: 'bg-yellow-400/30 text-yellow-100', emoji: '👑' },
    admin: { label: 'Administrador', badge: 'bg-blue-400/30 text-blue-100', emoji: '🔑' },
    baker: { label: 'Panadero Jefe', badge: 'bg-orange-400/30 text-orange-100', emoji: '👨‍🍳' },
};
// ============================================================================
// LOGIN PAGE - ULTRA BONITA Y DINÁMICA
// ============================================================================
// ============================================================================
// LOGIN FORM PANEL — definido FUERA del LoginPage para evitar pérdida de foco
// ============================================================================
const LoginFormPanel = ({ username, setUsername, password, setPassword, showPassword, setShowPassword, remember, setRemember, error, isLoading, quickLogin }) => (_jsxs("div", { className: "w-full space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-vanilla mb-2 tracking-wide", children: "\uD83D\uDC64 Usuario" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner", placeholder: "pancitos", autoComplete: "username" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-vanilla mb-2 tracking-wide", children: "\uD83D\uDD10 Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-vanilla/70 hover:text-vanilla transition-colors", children: showPassword ? _jsx(EyeOff, { size: 22 }) : _jsx(Eye, { size: 22 }) })] })] }), _jsx(AnimatePresence, { children: error && (_jsx(motion.div, { initial: { opacity: 0, y: -8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0 }, className: "bg-blush/40 border-2 border-blush/60 text-primary px-5 py-3 rounded-2xl text-sm text-center font-semibold backdrop-blur-sm", children: error })) }), _jsxs("label", { className: "flex items-center gap-3 text-vanilla/90 text-sm cursor-pointer font-medium", children: [_jsx("input", { type: "checkbox", checked: remember, onChange: (e) => setRemember(e.target.checked), className: "w-5 h-5 rounded-lg accent-peach cursor-pointer" }), "Recordar credenciales"] }), _jsx(motion.button, { whileHover: { scale: 1.03, boxShadow: '0 20px 50px rgba(212, 165, 116, 0.35)' }, whileTap: { scale: 0.97 }, type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-peach via-vanilla to-wheat hover:from-vanilla hover:to-peach text-primary font-bold py-4 rounded-3xl text-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-warm border border-white/30", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(motion.span, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity }, children: "\uD83E\uDD50" }), " Ingresando..."] })) : '✨ Ingresar' }), _jsxs("div", { children: [_jsx("p", { className: "text-vanilla/50 text-center text-xs font-semibold tracking-widest mb-3", children: "\u2726 Acceso R\u00E1pido" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                        { user: 'Administrador', label: 'Dueño', icon: '👑', color: 'from-honey/40 to-caramel/30' },
                        { user: 'pancitos', label: 'Panadero', icon: '👨‍🍳', color: 'from-peach/40 to-blush/30' },
                    ].map((q) => (_jsxs(motion.button, { type: "button", whileHover: { scale: 1.05, y: -3 }, whileTap: { scale: 0.95 }, onClick: () => quickLogin(q.user), className: `bg-gradient-to-br ${q.color} backdrop-blur-xl border border-white/30 text-vanilla py-3 px-4 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-glass hover:shadow-warm`, children: [_jsx("span", { className: "text-lg", children: q.icon }), _jsx("span", { children: q.label })] }, q.user))) })] })] }));
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('pancitos-remember');
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
                localStorage.setItem('pancitos-remember', JSON.stringify({ username }));
            }
            else {
                localStorage.removeItem('pancitos-remember');
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
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "min-h-screen bg-gradient-to-br from-primary via-mocha to-caramel relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(motion.div, { animate: { y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 5, 0] }, transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' }, className: "absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-peach/20 to-vanilla/10 rounded-full blur-3xl" }), _jsx(motion.div, { animate: { y: [0, 40, 0], x: [0, -25, 0] }, transition: { duration: 15, repeat: Infinity, delay: 2, ease: 'easeInOut' }, className: "absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-honey/15 to-caramel/10 rounded-full blur-3xl" }), _jsx(motion.div, { animate: { scale: [1, 1.1, 1] }, transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, className: "absolute top-1/3 right-1/4 w-64 h-64 bg-blush/10 rounded-full blur-2xl" })] }), _jsx("div", { className: "lg:hidden min-h-screen flex flex-col items-center justify-center p-5 relative z-10", children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.1, type: 'spring', stiffness: 100 }, className: "w-full max-w-sm", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(motion.div, { animate: { y: [0, -10, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, className: "text-8xl inline-block mb-4 drop-shadow-2xl", children: "\uD83E\uDD50" }), _jsx("h1", { className: "text-4xl font-bold font-playfair text-vanilla mb-2 tracking-wide", children: "PANCITOS" }), _jsx("p", { className: "text-peach/80 text-sm font-medium tracking-[0.25em] uppercase", children: "Panader\u00EDa Artesanal" }), _jsx("span", { className: "inline-block mt-3 px-4 py-1 rounded-full bg-honey/20 border border-honey/30 text-honey text-[10px] font-semibold tracking-widest uppercase", children: "v1.0.0 \u00B7 Premium" })] }), _jsx("div", { className: "glass-warm rounded-[32px] p-7 shadow-warm border border-white/20", children: _jsx("form", { onSubmit: handleLogin, children: _jsx(LoginFormPanel, { username: username, setUsername: setUsername, password: password, setPassword: setPassword, showPassword: showPassword, setShowPassword: setShowPassword, remember: remember, setRemember: setRemember, error: error, isLoading: isLoading, quickLogin: quickLogin }) }) }), _jsx("p", { className: "text-vanilla/30 text-xs text-center mt-6 font-medium", children: "\uD83D\uDD12 Datos seguros \u00B7 Funciona offline" })] }) }), _jsxs("div", { className: "hidden lg:flex min-h-screen relative z-10", children: [_jsx(motion.div, { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: 'easeOut' }, className: "w-[55%] flex flex-col items-center justify-center p-16 relative", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx(motion.div, { animate: { y: [0, -15, 0], rotate: [0, 3, -3, 0] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }, className: "text-[140px] leading-none mb-10 drop-shadow-2xl", children: "\uD83E\uDD50" }), _jsx("h1", { className: "text-7xl font-bold font-playfair text-vanilla mb-4 leading-tight tracking-wide", children: "PANCITOS" }), _jsx("p", { className: "text-peach/70 text-xl font-medium tracking-[0.4em] mb-14 uppercase", children: "Panader\u00EDa Artesanal" }), _jsx("div", { className: "grid grid-cols-2 gap-5 text-left", children: [
                                        { icon: '📖', title: '20 Recetas', desc: 'Pan, pasteles y más' },
                                        { icon: '🧮', title: 'Calculadora', desc: 'Escala ingredientes' },
                                        { icon: '🛒', title: 'Inventario', desc: '30 insumos listos' },
                                        { icon: '💰', title: 'Costos', desc: 'Analiza márgenes' },
                                    ].map((f) => (_jsxs(motion.div, { whileHover: { scale: 1.05, y: -4 }, className: "glass-warm backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-glass hover:shadow-warm transition-all duration-300", children: [_jsx("div", { className: "text-4xl mb-2", children: f.icon }), _jsx("p", { className: "text-vanilla font-semibold text-sm", children: f.title }), _jsx("p", { className: "text-peach/60 text-xs", children: f.desc })] }, f.title))) }), _jsxs("div", { className: "mt-12 flex items-center justify-center gap-4", children: [_jsx("div", { className: "w-2 h-2 bg-peach/50 rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("div", { className: "w-2 h-2 bg-peach/50 rounded-full animate-bounce", style: { animationDelay: '200ms' } }), _jsx("div", { className: "w-2 h-2 bg-peach/50 rounded-full animate-bounce", style: { animationDelay: '400ms' } })] })] }) }), _jsx(motion.div, { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 }, className: "w-[45%] flex items-center justify-center p-12 bg-gradient-to-br from-cocoa/40 to-primary/60 backdrop-blur-sm border-l border-caramel/20", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "mb-10", children: [_jsx("h2", { className: "text-4xl font-bold font-playfair text-vanilla mb-2", children: "Bienvenido" }), _jsx("p", { className: "text-peach/60 text-sm font-medium", children: "Ingresa tus credenciales para continuar" })] }), _jsx("form", { onSubmit: handleLogin, children: _jsx(LoginFormPanel, { username: username, setUsername: setUsername, password: password, setPassword: setPassword, showPassword: showPassword, setShowPassword: setShowPassword, remember: remember, setRemember: setRemember, error: error, isLoading: isLoading, quickLogin: quickLogin }) }), _jsx("p", { className: "text-vanilla/25 text-xs text-center mt-10", children: "\uD83D\uDD12 Datos seguros \u00B7 Modo offline disponible" })] }) })] })] }));
};
// ============================================================================
// HOME DASHBOARD - ULTRA DINÁMICO Y HERMOSO
// ============================================================================
const HomePage = ({ user, stats, onNavigate }) => {
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "relative overflow-hidden rounded-[32px] p-7 lg:p-10 bg-gradient-to-br from-primary via-mocha to-caramel shadow-warm", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute -top-10 -right-10 w-40 h-40 bg-peach/20 rounded-full blur-2xl" }), _jsx("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-honey/15 rounded-full blur-2xl" })] }), _jsxs("div", { className: "relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-5", children: [_jsx(motion.div, { animate: { y: [0, -10, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, className: "text-7xl lg:text-8xl", children: "\uD83E\uDD50" }), _jsxs("div", { className: "text-center lg:text-left", children: [_jsxs("h2", { className: "text-3xl lg:text-5xl font-bold font-playfair text-vanilla mb-3", children: ["\u00A1Hola, ", user.username, "!"] }), _jsx("p", { className: "text-peach/70 text-sm mb-4 font-medium", children: "Bienvenido de vuelta a tu panel de control" }), _jsxs("span", { className: "inline-block px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full text-vanilla text-xs font-semibold border border-white/20 shadow-glass", children: [user.role === 'superadmin' && '👑 Dueño / Super Admin', user.role === 'admin' && '🔑 Administrador', user.role === 'baker' && '👨‍🍳 Panadero Jefe'] })] })] })] }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
                    { label: 'Recetas', value: stats.recipes, icon: '📖', gradient: 'from-peach/30 to-blush/20', border: 'border-peach/30', view: 'recipes', enabled: true },
                    { label: 'Inventario', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '🛒', gradient: 'from-honey/30 to-vanilla/20', border: 'border-honey/30', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
                    { label: 'Porciones', value: stats.recipes > 0 ? Math.floor(stats.recipes * 3) : '—', icon: '🥐', gradient: 'from-blush/30 to-peach/20', border: 'border-blush/30', view: 'calculator', enabled: PERMS.canUseCalculator(user.role) },
                    { label: 'Insumos', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '📦', gradient: 'from-wheat/40 to-latte/30', border: 'border-wheat/40', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
                ].map((stat, i) => (_jsxs(motion.button, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.1 + i * 0.05 }, whileHover: { y: -6, boxShadow: '0 15px 35px rgba(107, 68, 35, 0.15)' }, whileTap: { scale: 0.95 }, onClick: () => stat.enabled && onNavigate(stat.view), disabled: !stat.enabled, className: `rounded-3xl p-5 lg:p-6 text-left shadow-glass transition-all duration-300 border-2 backdrop-blur-sm ${stat.enabled
                        ? `bg-gradient-to-br ${stat.gradient} ${stat.border} hover:shadow-warm cursor-pointer`
                        : 'bg-latte/30 opacity-40 cursor-not-allowed border-latte/30'}`, children: [_jsx(motion.div, { animate: { scale: [1, 1.1, 1] }, transition: { duration: 3, repeat: Infinity, delay: i * 0.4 }, className: "text-4xl mb-3", children: stat.icon }), _jsx("p", { className: "text-xs font-semibold opacity-70 mb-1 text-primary dark:text-vanilla tracking-wide", children: stat.label }), _jsx("p", { className: "text-3xl font-bold text-primary dark:text-vanilla", children: stat.value })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 }, whileHover: { scale: 1.02, boxShadow: '0 20px 50px rgba(107, 68, 35, 0.2)' }, whileTap: { scale: 0.97 }, onClick: () => onNavigate('recipes'), className: "w-full bg-gradient-to-r from-primary via-mocha to-primary text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20", children: [_jsx(motion.span, { animate: { rotate: [0, 8, -8, 0] }, transition: { duration: 3, repeat: Infinity }, children: _jsx(BookOpen, { size: 26 }) }), _jsx("span", { children: "\uD83D\uDCD6 Recetas" })] }), _jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.25 }, whileHover: { scale: 1.02, boxShadow: '0 20px 50px rgba(196, 149, 106, 0.25)' }, whileTap: { scale: 0.97 }, onClick: () => onNavigate('calculator'), className: "w-full bg-gradient-to-r from-caramel via-secondary to-caramel text-flour py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-honey/30", children: [_jsx(motion.span, { animate: { rotate: [-8, 8, -8] }, transition: { duration: 2.5, repeat: Infinity }, children: _jsx(Zap, { size: 26 }) }), _jsx("span", { children: "\uD83E\uDDEE Escalar Receta" })] }), PERMS.canViewInventory(user.role) && (_jsxs(_Fragment, { children: [_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 }, whileHover: { scale: 1.02, boxShadow: '0 20px 50px rgba(212, 165, 116, 0.2)' }, whileTap: { scale: 0.97 }, onClick: () => onNavigate('inventory'), className: "w-full bg-gradient-to-r from-mocha via-primary to-mocha text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20", children: [_jsx(motion.span, { animate: { y: [0, -4, 0] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(ShoppingCart, { size: 26 }) }), _jsx("span", { children: "\uD83D\uDED2 Inventario" })] }), PERMS.canViewCosts(user.role) && (_jsxs(motion.button, { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.35 }, whileHover: { scale: 1.02, boxShadow: '0 20px 50px rgba(245, 193, 108, 0.2)' }, whileTap: { scale: 0.97 }, onClick: () => onNavigate('costs'), className: "w-full bg-gradient-to-r from-honey via-caramel to-honey text-primary py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-vanilla/30", children: [_jsx(motion.span, { animate: { scale: [1, 1.15, 1] }, transition: { duration: 2, repeat: Infinity }, children: _jsx(TrendingUp, { size: 26 }) }), _jsx("span", { children: "\uD83D\uDCB0 An\u00E1lisis Costos" })] }))] }))] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "grid grid-cols-3 gap-3", children: [
                    { icon: '✨', text: 'Glassmorphism UI' },
                    { icon: '⚡', text: 'Ultra rápido' },
                    { icon: '💾', text: 'Guarda offline' },
                ].map((info) => (_jsxs("div", { className: "glass-card bg-gradient-to-br from-vanilla/60 to-wheat/40 border border-caramel/20 rounded-2xl p-4 text-center shadow-glass", children: [_jsx("div", { className: "text-2xl mb-1", children: info.icon }), _jsx("p", { className: "text-xs font-semibold text-primary/80 dark:text-vanilla/80", children: info.text })] }, info.text))) })] }));
};
// ============================================================================
// MOBILE NAVBAR - ULTRA DINÁMICA
// ============================================================================
const MobileNavbar = ({ user, currentView, onViewChange, onLogout }) => {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: '🏠', color: 'text-amber-300', dot: 'bg-amber-400' },
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
    // Roles: superadmin/admin = gestión completa | baker = CRUD recetas + ver inventario (sin costos)
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
        // Todos los usuarios ven todas las recetas
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
    // Añade un ingrediente desde el inventario con su unidad predeterminada
    const addIngredientFromInventory = (operationId) => {
        const operation = state.operations.find(op => op.id === operationId);
        if (!operation)
            return;
        const ingredients = formData.ingredients || [];
        // Verificar si ya existe este ingrediente
        const exists = ingredients.some(ing => normalizeIngredientName(ing.name) === normalizeIngredientName(operation.name));
        if (exists) {
            alert('Este ingrediente ya está en la receta');
            return;
        }
        // Convertir tipo de inventario a unidad de receta
        const unitMap = {
            'kg': 'g',
            'L': 'ml',
            'unid': 'unid',
        };
        ingredients.push({
            id: Math.random().toString(),
            name: operation.name,
            quantity: 0,
            unit: unitMap[operation.type] || 'g',
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
        return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "sticky top-0 bg-gradient-to-b from-primary via-mocha to-caramel/90 dark:from-[#1A0D08] dark:via-[#201210] dark:to-[#251410] z-10 pt-5 pb-4 space-y-4 -mx-4 px-4 rounded-b-[32px] shadow-warm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-colors duration-300", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(motion.div, { animate: { y: [0, -5, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }, className: "text-4xl", children: isBaker ? '👨‍🍳' : '👑' }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-vanilla/70 tracking-wide", children: isBaker ? 'Modo Panadero' : 'Modo Administrador' }), _jsx("h2", { className: "text-2xl font-bold text-vanilla font-playfair tracking-wide", children: "Gesti\u00F3n de Recetas" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(motion.input, { whileFocus: { scale: 1.02 }, type: "text", placeholder: "\uD83D\uDD0D Buscar receta...", value: search, onChange: (e) => setSearch(e.target.value), className: "flex-1 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-peach/30 text-lg font-medium text-vanilla placeholder-vanilla/50 shadow-glass focus:shadow-warm focus:border-peach/50 transition-all" }), _jsx(motion.button, { whileHover: { scale: 1.08 }, whileTap: { scale: 0.92 }, onClick: () => {
                                        setEditingId(null);
                                        setFormData({
                                            category: 'Panadería',
                                            ingredients: [],
                                            temperature: 180,
                                            time: 30,
                                        });
                                        setShowForm(!showForm);
                                    }, className: "bg-gradient-to-br from-peach to-caramel hover:from-caramel hover:to-peach text-primary p-4 rounded-2xl font-bold transition-all shadow-warm hover:shadow-glass-lg", children: _jsx(Plus, { size: 26 }) })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: ['all', 'Panadería', 'Pastelería'].map((cat, idx) => (_jsx(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => setCategory(cat), className: `px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${category === cat
                                    ? 'bg-gradient-to-r from-peach to-vanilla text-primary shadow-warm border border-white/30'
                                    : 'bg-white/15 backdrop-blur-sm text-vanilla/80 border border-white/20 hover:bg-white/25'}`, children: cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel' }, cat))) })] }), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-[#251410]/95 dark:to-[#1A0D08]/95 border border-caramel/25 dark:border-amber-800/25 rounded-[28px] p-6 shadow-warm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-300", children: _jsxs("form", { onSubmit: handleSaveRecipe, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide", children: "\uD83D\uDCDD Nombre de Receta" }), _jsx(motion.input, { whileFocus: { scale: 1.01 }, type: "text", value: formData.name || '', onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 dark:placeholder-amber-200/40 text-lg font-medium transition-all shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide", children: "\uD83D\uDCC2 Categor\u00EDa" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all", children: [_jsx("option", { children: "Panader\u00EDa" }), _jsx("option", { children: "Pasteler\u00EDa" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide", children: "\uD83C\uDF21\uFE0F Temperatura" }), _jsx(motion.input, { whileFocus: { scale: 1.01 }, type: "number", value: formData.temperature || 180, onChange: (e) => setFormData({ ...formData, temperature: Number(e.target.value) }), className: "w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide", children: "\u23F1\uFE0F Tiempo (minutos)" }), _jsx(motion.input, { whileFocus: { scale: 1.01 }, type: "number", value: formData.time || 30, onChange: (e) => setFormData({ ...formData, time: Number(e.target.value) }), className: "w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex flex-col gap-2 mb-3", children: [_jsx("label", { className: "text-xs font-semibold text-primary dark:text-amber-100 tracking-wide", children: "\uD83E\uDD44 Ingredientes (del inventario)" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { id: "inventoryIngredientSelect", className: "flex-1 px-3 py-2.5 rounded-xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all", defaultValue: "", children: [_jsx("option", { value: "", disabled: true, children: "-- Selecciona del inventario --" }), state.operations.map((op) => {
                                                                    const alreadyAdded = (formData.ingredients || []).some(ing => normalizeIngredientName(ing.name) === normalizeIngredientName(op.name));
                                                                    return (_jsxs("option", { value: op.id, disabled: alreadyAdded, children: [op.name, " (", op.type, ") ", alreadyAdded ? '✓ Añadido' : ''] }, op.id));
                                                                })] }), _jsx(motion.button, { whileTap: { scale: 0.95 }, type: "button", onClick: () => {
                                                                const select = document.getElementById('inventoryIngredientSelect');
                                                                if (select && select.value) {
                                                                    addIngredientFromInventory(select.value);
                                                                    select.value = '';
                                                                }
                                                            }, className: "text-primary dark:text-amber-100 text-sm font-semibold bg-gradient-to-r from-peach/60 to-caramel/40 dark:from-amber-800/60 dark:to-amber-700/40 px-4 py-2.5 rounded-xl transition-all border border-caramel/40 dark:border-amber-700/50 hover:from-peach/80 hover:to-caramel/60 dark:hover:from-amber-700/60 dark:hover:to-amber-600/50 shadow-sm", children: "+ A\u00F1adir" })] }), state.operations.length === 0 && (_jsx("p", { className: "text-xs text-red-500 dark:text-red-400 mt-1", children: "\u26A0\uFE0F No hay ingredientes en el inventario. Agrega insumos primero." }))] }), (formData.ingredients || []).length > 0 && (_jsxs("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: [_jsx("p", { className: "text-xs font-medium text-mocha/70 dark:text-amber-200/60", children: "Ingredientes a\u00F1adidos:" }), (formData.ingredients || []).map((ing) => (_jsxs("div", { className: "flex gap-2 items-center bg-vanilla/50 dark:bg-amber-900/30 p-2 rounded-xl border border-caramel/20 dark:border-amber-700/30", children: [_jsxs("span", { className: "flex-1 text-sm font-medium text-primary dark:text-amber-100 truncate", children: ["\uD83D\uDCE6 ", ing.name] }), _jsx("input", { type: "number", placeholder: "Cant.", step: "0.1", min: "0", value: ing.quantity || '', onChange: (e) => updateIngredient(ing.id, 'quantity', Number(e.target.value)), className: "w-20 px-3 py-2 rounded-xl border-2 border-caramel/25 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all text-center" }), _jsxs("select", { value: ing.unit, onChange: (e) => updateIngredient(ing.id, 'unit', e.target.value), className: "px-3 py-2 rounded-xl border-2 border-caramel/25 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all", children: [_jsx("option", { value: "g", children: "g" }), _jsx("option", { value: "kg", children: "kg" }), _jsx("option", { value: "ml", children: "ml" }), _jsx("option", { value: "L", children: "L" }), _jsx("option", { value: "unid", children: "unid" })] }), _jsx(motion.button, { whileTap: { scale: 0.9 }, type: "button", onClick: () => removeIngredient(ing.id), className: "bg-red-400/30 hover:bg-red-400/50 text-red-600 dark:text-red-400 p-2 rounded-xl transition-all hover:shadow-glass", children: _jsx(Trash2, { size: 16 }) })] }, ing.id)))] }))] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs(motion.button, { whileTap: { scale: 0.97 }, whileHover: { scale: 1.02 }, type: "submit", className: "flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-vanilla px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg shadow-warm hover:shadow-glass-lg", children: ["\u2728 ", editingId ? 'Actualizar' : 'Crear Receta'] }), _jsx(motion.button, { whileTap: { scale: 0.97 }, type: "button", onClick: () => {
                                                setShowForm(false);
                                                setEditingId(null);
                                            }, className: "flex-1 bg-latte/60 hover:bg-latte/80 text-primary px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg border border-caramel/25", children: "\u2715 Cancelar" })] })] }) })) }), _jsx("div", { className: `${isMobile ? 'grid gap-4' : 'grid grid-cols-2 lg:grid-cols-3 gap-5'}`, children: recipes.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "text-center py-16 col-span-full", children: [_jsx(motion.div, { animate: { y: [0, -15, 0] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }, className: "text-7xl mb-4", children: "\uD83D\uDCD6" }), _jsx("p", { className: "font-semibold text-lg text-primary dark:text-vanilla", children: "No hay recetas a\u00FAn" }), _jsx("p", { className: "text-sm opacity-60 text-mocha", children: search || category !== 'all' ? 'Intenta con otro filtro' : 'Crea tu primera receta' })] })) : (recipes.map((recipe, idx) => (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { delay: idx * 0.05 }, whileHover: { y: -5, boxShadow: '0 20px 40px rgba(196, 149, 106, 0.25)' }, className: "card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/90 dark:to-cocoa/80 border-2 border-caramel/40 dark:border-caramel/30 rounded-3xl p-6 hover:shadow-warm transition-all cursor-pointer active:scale-95 group", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-2xl font-bold font-serif text-primary dark:text-vanilla mb-2", children: recipe.name }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs("span", { className: "px-3 py-1 bg-gradient-to-r from-peach/50 to-caramel/40 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 dark:border-caramel/40", children: [recipe.category === 'Panadería' ? '🍞' : '🎂', " ", recipe.category] }), _jsxs("span", { className: "px-3 py-1 bg-blush/40 dark:bg-mocha/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-blush/50 dark:border-caramel/30", children: ["\uD83D\uDC68\u200D\uD83C\uDF73 ", recipe.createdBy] })] })] }), _jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-all", children: [_jsx(motion.button, { whileTap: { scale: 0.8 }, onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleEdit(recipe);
                                                }, className: "bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-3 rounded-xl transition-all hover:shadow-lg border border-caramel/20", children: _jsx(Edit2, { size: 20 }) }), _jsx(motion.button, { whileTap: { scale: 0.8 }, onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleDelete(recipe.id);
                                                }, className: "bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-3 rounded-xl transition-all hover:shadow-lg border border-blush/30", children: _jsx(Trash2, { size: 20 }) })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-peach/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-caramel/25", children: [_jsx("p", { className: "opacity-70 text-xs font-semibold text-primary dark:text-vanilla", children: "\uD83E\uDD44 ING" }), _jsx("p", { className: "font-bold text-lg text-primary dark:text-peach", children: recipe.ingredients.length })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-blush/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-blush/30", children: [_jsx("p", { className: "opacity-70 text-xs font-semibold text-primary dark:text-vanilla", children: "\uD83C\uDF21\uFE0F T" }), _jsxs("p", { className: "font-bold text-lg text-primary dark:text-blush", children: [recipe.temperature, "\u00B0"] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-honey/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-honey/30", children: [_jsx("p", { className: "opacity-70 text-xs font-semibold text-primary dark:text-vanilla", children: "\u23F1\uFE0F T" }), _jsxs("p", { className: "font-bold text-lg text-primary dark:text-honey", children: [recipe.time, "m"] })] })] }), _jsx("p", { className: "text-xs text-mocha dark:text-latte line-clamp-2 font-medium opacity-80", children: recipe.ingredients.map(ing => `${ing.name}`).join(' • ') })] }, recipe.id)))) })] }));
    }
    // MODO LECTURA — este código ya no se usa porque todos los roles actuales pueden editar
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "sticky top-0 glass-warm bg-gradient-to-b from-mocha via-primary/95 to-cinnamon/90 dark:from-cocoa dark:via-mocha/95 dark:to-primary/80 z-10 pt-4 pb-3 space-y-3 -mx-3 px-3 rounded-b-3xl shadow-warm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(motion.div, { animate: { y: [0, -5, 0] }, transition: { duration: 2, repeat: Infinity }, className: "text-3xl", children: "\uD83D\uDCDA" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-vanilla/80", children: "MODO LECTURA" }), _jsx("h2", { className: "text-xl font-bold text-cream font-serif", children: "Recetas" })] }), _jsx("span", { className: "ml-auto text-xs bg-white/20 text-cream/90 font-semibold px-3 py-1 rounded-full border border-cream/30", children: "\uD83D\uDC41\uFE0F Solo lectura" })] }), _jsx("input", { type: "text", placeholder: "\uD83D\uDD0D Buscar receta...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full px-5 py-3 rounded-2xl bg-cream/90 dark:bg-mocha/40 border-2 border-caramel/30 dark:border-caramel/40 text-base font-medium text-primary dark:text-vanilla placeholder-mocha/60 dark:placeholder-latte/60 focus:outline-none focus:border-caramel transition-all" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", children: ['all', 'Panadería', 'Pastelería'].map((cat) => (_jsx("button", { onClick: () => setCategory(cat), className: `px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === cat
                                ? 'bg-peach text-primary shadow-md'
                                : 'bg-cream/30 dark:bg-mocha/40 text-cream dark:text-vanilla'}`, children: cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel' }, cat))) })] }), _jsx("div", { className: `${isMobile ? 'grid gap-3' : 'grid grid-cols-2 lg:grid-cols-3 gap-6'}`, children: recipes.length === 0 ? (_jsxs("div", { className: "col-span-full text-center py-16", children: [_jsx("p", { className: "text-4xl mb-3", children: "\uD83D\uDD0D" }), _jsx("p", { className: "font-semibold text-lg text-mocha", children: "Sin resultados" })] })) : (recipes.map((recipe, idx) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, transition: { delay: idx * 0.05 }, whileHover: { x: 4, boxShadow: '0 12px 28px rgba(196, 149, 106, 0.2)' }, className: "card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/85 dark:from-mocha/50 dark:to-cocoa/60 border-2 border-caramel/30 dark:border-caramel/40 rounded-3xl p-5 transition-all", children: [_jsx("h3", { className: "text-xl font-bold font-serif text-primary dark:text-vanilla mb-2", children: recipe.name }), _jsxs("span", { className: "px-3 py-1 bg-peach/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 inline-block mb-3", children: [recipe.category === 'Panadería' ? '🍞' : '🎂', " ", recipe.category] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3", children: [_jsxs("div", { className: "glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-blush/40 dark:border-caramel/30", children: [_jsx("p", { className: "text-[10px] font-semibold text-primary/70 dark:text-vanilla/70", children: "\uD83C\uDF21\uFE0F TEMP" }), _jsxs("p", { className: "font-bold text-lg text-primary dark:text-blush", children: [recipe.temperature, "\u00B0"] })] }), _jsxs("div", { className: "glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-honey/40 dark:border-caramel/30", children: [_jsx("p", { className: "text-[10px] font-semibold text-primary/70 dark:text-vanilla/70", children: "\u23F1\uFE0F TIEMPO" }), _jsxs("p", { className: "font-bold text-lg text-primary dark:text-honey", children: [recipe.time, "m"] })] })] }), _jsxs("div", { className: "glass bg-cream/60 dark:bg-mocha/30 rounded-2xl p-3 max-h-48 overflow-y-auto border border-caramel/20 dark:border-caramel/30", children: [_jsxs("p", { className: "text-[10px] font-semibold text-primary/70 dark:text-vanilla/70 mb-1", children: ["\uD83E\uDD44 INGREDIENTES (", recipe.ingredients.length, ")"] }), recipe.ingredients.map((ing) => (_jsxs("p", { className: "text-sm font-medium text-primary dark:text-vanilla", children: ["\u2022 ", ing.name, " ", _jsxs("span", { className: "text-xs opacity-60", children: [ing.quantity, ing.unit] })] }, ing.id)))] })] }, recipe.id)))) })] }));
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
    const [cooked, setCooked] = useState(false);
    const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);
    const calculateTotalMass = (recipe) => {
        return recipe.ingredients.reduce((sum, ing) => {
            const value = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
            return sum + value;
        }, 0);
    };
    // Función para verificar si hay suficiente stock
    const checkSufficientStock = (recipe) => {
        const missing = [];
        for (const ing of recipe.ingredients) {
            const operation = state.operations.find((op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name)));
            if (operation) {
                // Convertir a gramos/ml para comparar
                const requiredGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                if (operation.stockQuantity < requiredGrams) {
                    missing.push({
                        name: ing.name,
                        required: requiredGrams,
                        available: operation.stockQuantity,
                        unit: operation.type === 'unid' ? 'unid' : (operation.type === 'kg' ? 'g' : 'ml')
                    });
                }
            }
        }
        return { sufficient: missing.length === 0, missing };
    };
    // Función para cocinar y descontar del inventario
    const handleCook = () => {
        if (!scaledRecipe)
            return;
        const stockCheck = checkSufficientStock(scaledRecipe);
        if (!stockCheck.sufficient) {
            const missingList = stockCheck.missing.map(m => `${m.name}: necesitas ${m.required.toFixed(0)}${m.unit}, tienes ${m.available.toFixed(0)}${m.unit}`).join('\n');
            alert(`❌ Stock insuficiente:\n\n${missingList}`);
            return;
        }
        // Descontar de inventario
        for (const ing of scaledRecipe.ingredients) {
            const operation = state.operations.find((op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name)));
            if (operation) {
                const usedGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                const newStock = Math.max(0, operation.stockQuantity - usedGrams);
                state.updateOperation(operation.id, {
                    ...operation,
                    stockQuantity: newStock
                });
            }
        }
        setCooked(true);
        setTimeout(() => setCooked(false), 3000);
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
        setCooked(false); // Reset cooked state
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
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-lg font-bold text-primary dark:text-vanilla", children: "\uD83D\uDCD6 Selecciona una Receta" }), _jsxs("select", { value: selectedRecipeId || '', onChange: (e) => {
                            setSelectedRecipeId(e.target.value);
                            setScaledRecipe(null);
                            setProductQuantity(1);
                        }, className: "w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", children: [_jsx("option", { value: "", children: "-- Elige una receta --" }), state.recipes.map((r) => (_jsx("option", { value: r.id, children: r.name }, r.id)))] })] }), selectedRecipe && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "glass-warm bg-cream/70 dark:bg-mocha/50 p-4 rounded-2xl border border-caramel/30", children: [_jsx("h4", { className: "font-bold text-sm text-primary dark:text-vanilla mb-3", children: "\uD83D\uDCE6 Disponibilidad de Ingredientes:" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: selectedRecipe.ingredients.map((ing) => {
                                    const availability = checkIngredientInInventory(ing.name, state.operations);
                                    return (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: availability.available ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400', children: availability.available ? '✓' : '✗' }), _jsx("span", { className: availability.available ? 'text-primary dark:text-vanilla' : 'text-red-600 dark:text-red-400', children: ing.name })] }), !availability.available ? (_jsx("span", { className: "px-2 py-0.5 text-xs font-bold bg-red-500/90 text-white rounded-full", children: "AGOTADO" })) : (_jsx("span", { className: "text-xs text-green-600 dark:text-green-400 font-medium", children: "En stock" }))] }, ing.id));
                                }) }), (() => {
                                const unavailableCount = selectedRecipe.ingredients.filter((ing) => !checkIngredientInInventory(ing.name, state.operations).available).length;
                                const totalCount = selectedRecipe.ingredients.length;
                                return (_jsx("div", { className: `mt-3 pt-3 border-t ${unavailableCount > 0 ? 'border-red-300 dark:border-red-700' : 'border-green-300 dark:border-green-700'}`, children: _jsx("p", { className: `text-xs font-semibold ${unavailableCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`, children: unavailableCount > 0
                                            ? `⚠️ ${totalCount - unavailableCount}/${totalCount} ingredientes disponibles`
                                            : `✅ ${totalCount}/${totalCount} ingredientes disponibles` }) }));
                            })()] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: () => setScaleType('quantity'), className: `p-3 rounded-2xl font-semibold transition text-lg ${scaleType === 'quantity'
                                    ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                                    : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'}`, children: "\uD83C\uDF5E Unidades" }), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: () => setScaleType('ingredient'), className: `p-3 rounded-2xl font-semibold transition text-lg ${scaleType === 'ingredient'
                                    ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                                    : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'}`, children: "\uD83E\uDD44 Ingrediente" })] }), scaleType === 'ingredient' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold mb-2 block text-primary dark:text-vanilla", children: "\uD83E\uDD44 Ingrediente base" }), _jsxs("select", { value: baseIngredientId || '', onChange: (e) => setBaseIngredientId(e.target.value), className: "w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla mb-3", children: [_jsx("option", { value: "", children: "-- Selecciona --" }), selectedRecipe.ingredients.map((ing) => (_jsxs("option", { value: ing.id, children: [ing.name, " (", ing.quantity, ing.unit, ")"] }, ing.id)))] })] }), baseIngredientId && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold mb-2 block text-primary dark:text-vanilla", children: "\uD83C\uDFAF Cantidad nueva" }), _jsx("input", { type: "number", placeholder: "Ej: 500", value: baseValue || '', onChange: (e) => setBaseValue(Number(e.target.value)), className: "w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla" })] }))] })), scaleType === 'quantity' && (_jsxs("div", { children: [_jsxs("label", { className: "text-sm font-semibold mb-2 block text-primary dark:text-vanilla", children: ["\uD83C\uDF5E \u00BFCu\u00E1ntos ", selectedRecipe.category === 'Panadería' ? 'panes' : 'pasteles', " quieres hacer?"] }), _jsx("input", { type: "number", min: "1", step: "1", placeholder: "Ej: 5", value: productQuantity || 1, onChange: (e) => setProductQuantity(Math.max(1, Number(e.target.value))), className: "w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla" }), _jsxs("p", { className: "text-xs text-mocha/70 dark:text-latte/70 mt-2", children: ["\uD83D\uDCCF Masa para 1: ", calculateTotalMass(selectedRecipe).toFixed(0), " g | Para ", productQuantity, ": ", (calculateTotalMass(selectedRecipe) * productQuantity).toFixed(0), " g"] })] })), _jsx(motion.button, { whileTap: { scale: 0.95 }, onClick: handleScale, className: "w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition disabled:opacity-50 text-lg shadow-warm", children: "\u26A1 Escalar Receta" })] })), scaledRecipe && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, id: "recipe-export", className: "card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/80 dark:to-cocoa/90 border-2 border-caramel/40 dark:border-caramel/30 rounded-2xl p-6", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("span", { className: "inline-block px-3 py-1 text-xs font-bold bg-caramel/30 text-primary dark:text-peach rounded-full mb-2", children: scaledRecipe.category === 'Panadería' ? '🍞 Panadería' : '🎂 Pastelería' }), _jsx("h2", { className: "text-2xl font-bold font-serif text-primary dark:text-vanilla", children: scaledRecipe.name }), _jsxs("p", { className: "text-sm font-semibold text-secondary dark:text-peach", children: ["\uD83D\uDD22 ", scaleType === 'quantity' ? `${productQuantity} unidades` : `Escalada ${scale.toFixed(2)}x`] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-blush/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-blush/30 text-center", children: [_jsx("p", { className: "text-2xl mb-1", children: "\uD83C\uDF21\uFE0F" }), _jsx("p", { className: "text-xs text-mocha/70 dark:text-latte/70 font-medium", children: "Temperatura" }), _jsxs("p", { className: "text-xl font-bold text-primary dark:text-blush", children: [scaledRecipe.temperature, "\u00B0C"] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-honey/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-honey/30 text-center", children: [_jsx("p", { className: "text-2xl mb-1", children: "\u23F1\uFE0F" }), _jsx("p", { className: "text-xs text-mocha/70 dark:text-latte/70 font-medium", children: "Tiempo" }), _jsxs("p", { className: "text-xl font-bold text-primary dark:text-honey", children: [scaledRecipe.time, " min"] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-peach/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-peach/30 text-center", children: [_jsx("p", { className: "text-2xl mb-1", children: "\uD83D\uDCCF" }), _jsx("p", { className: "text-xs text-mocha/70 dark:text-latte/70 font-medium", children: "Masa Total" }), _jsxs("p", { className: "text-xl font-bold text-primary dark:text-peach", children: [(calculateTotalMass(scaledRecipe) / 1000).toFixed(2), " kg"] })] })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [_jsx("h3", { className: "font-bold text-lg text-primary dark:text-vanilla", children: "\uD83E\uDD44 Ingredientes:" }), scaledRecipe.ingredients.map((ing) => {
                                const availability = checkIngredientInInventory(ing.name, state.operations);
                                return (_jsxs("div", { className: `flex justify-between items-center pb-2 border-b ${availability.available ? 'border-caramel/30 dark:border-caramel/40' : 'border-red-400/50 dark:border-red-500/40'}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `font-medium ${availability.available ? 'text-primary dark:text-vanilla' : 'text-red-600 dark:text-red-400'}`, children: ing.name }), !availability.available && (_jsx("span", { className: "px-2 py-0.5 text-xs font-bold bg-red-500/90 text-white rounded-full animate-pulse", children: "AGOTADO" }))] }), _jsxs("span", { className: `font-mono font-bold text-lg ${availability.available ? 'text-secondary dark:text-peach' : 'text-red-500 dark:text-red-400'}`, children: [ing.quantity.toFixed(2), " ", ing.unit] })] }, ing.id));
                            }), (() => {
                                const unavailableCount = scaledRecipe.ingredients.filter((ing) => !checkIngredientInInventory(ing.name, state.operations).available).length;
                                if (unavailableCount > 0) {
                                    return (_jsx("div", { className: "bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 rounded-xl mt-2", children: _jsxs("p", { className: "text-red-700 dark:text-red-300 font-semibold text-sm", children: ["\u26A0\uFE0F ", unavailableCount, " ingrediente", unavailableCount > 1 ? 's' : '', " no disponible", unavailableCount > 1 ? 's' : '', " en inventario"] }) }));
                                }
                                return (_jsx("div", { className: "bg-green-100/80 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-3 rounded-xl mt-2", children: _jsx("p", { className: "text-green-700 dark:text-green-300 font-semibold text-sm", children: "\u2705 Todos los ingredientes disponibles en inventario" }) }));
                            })()] }), scaledRecipe.instructions && (_jsxs("div", { className: "glass-warm bg-cream/70 dark:bg-mocha/50 p-4 rounded-xl border border-caramel/30 mb-4", children: [_jsx("h3", { className: "font-bold text-sm text-primary dark:text-vanilla mb-2", children: "\uD83D\uDCDD Instrucciones:" }), _jsx("p", { className: "text-sm text-mocha dark:text-latte leading-relaxed", children: scaledRecipe.instructions })] })), (() => {
                        let totalCost = 0;
                        let hasFullCostData = true;
                        scaledRecipe.ingredients.forEach((ing) => {
                            const operation = state.operations.find((op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                                normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                                normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name)));
                            if (operation) {
                                const totalGrams = operation.type === 'kg' ? operation.presentationWeight * operation.unitsPurchased * 1000 :
                                    operation.type === 'L' ? operation.presentationWeight * operation.unitsPurchased * 1000 :
                                        operation.presentationWeight * operation.unitsPurchased;
                                const costPerGram = operation.totalCost / totalGrams;
                                const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                                totalCost += costPerGram * ingGrams;
                            }
                            else {
                                hasFullCostData = false;
                            }
                        });
                        if (totalCost > 0) {
                            const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: 'COP', minimumFractionDigits: 0
                            }).format(value);
                            return (_jsx("div", { className: "glass-warm bg-gradient-to-r from-honey/40 to-caramel/30 dark:from-amber-900/40 dark:to-amber-800/30 p-4 rounded-xl border border-honey/40 mb-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-mocha/70 dark:text-amber-200/70 font-medium", children: "\uD83D\uDCB0 Costo Estimado de Ingredientes" }), _jsx("p", { className: "text-2xl font-bold text-primary dark:text-amber-100", children: formatCurrency(totalCost) })] }), !hasFullCostData && (_jsx("span", { className: "text-xs bg-orange-400/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full", children: "Parcial" }))] }) }));
                        }
                        return null;
                    })(), !cooked ? (_jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: handleCook, className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 text-lg shadow-lg mb-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83C\uDF73" }), "COCINAR - Descontar Ingredientes"] })) : (_jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg mb-3", children: [_jsx("span", { className: "text-2xl", children: "\u2705" }), "\u00A1Ingredientes descontados del inventario!"] })), _jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: exportImage, className: "w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm", children: [_jsx(Download, { size: 20 }), "\uD83D\uDCE5 DESCARGAR PNG"] })] }))] }));
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
        // Calcular stock inicial si no existe
        const calculateInitialStock = () => {
            if (formData.stockQuantity !== undefined)
                return formData.stockQuantity;
            const pw = formData.presentationWeight || 0;
            const up = formData.unitsPurchased || 0;
            if (formData.type === 'kg' || formData.type === 'L') {
                return pw * up * 1000; // Convertir a g/ml
            }
            return pw * up; // Unidades
        };
        if (editingId) {
            state.updateOperation(editingId, {
                id: editingId,
                ...formData,
                stockQuantity: formData.stockQuantity ?? calculateInitialStock(),
            });
            setEditingId(null);
        }
        else {
            state.addOperation({
                id: Date.now().toString() + Math.random(),
                ...formData,
                stockQuantity: calculateInitialStock(),
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
                }, className: "w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm", children: [_jsx(Plus, { size: 24 }), "\u2795 Nuevo Insumo"] })), !canEdit && (_jsxs("div", { className: "flex items-center gap-3 glass-warm bg-vanilla/80 dark:bg-mocha/40 border border-caramel/30 dark:border-caramel/40 rounded-2xl p-4", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC41\uFE0F" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-primary dark:text-vanilla text-sm", children: "Vista de Inventario" }), _jsx("p", { className: "text-xs text-mocha dark:text-latte", children: "Puedes consultar los insumos y sus costos" })] })] })), _jsx(AnimatePresence, { children: showForm && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-mocha/60 dark:to-cocoa/70 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4", children: _jsxs("form", { onSubmit: handleSave, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: "\uD83D\uDCDD Nombre" }), _jsx("input", { type: "text", value: formData.name || '', onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", placeholder: "Ej: Harina Premium" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: "\uD83D\uDCCA Tipo" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", children: [_jsx("option", { value: "kg", children: "kg" }), _jsx("option", { value: "L", children: "L" }), _jsx("option", { value: "unid", children: "Unidad" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: "\u2696\uFE0F Peso/Presentaci\u00F3n" }), _jsx("input", { type: "number", step: "0.1", value: formData.presentationWeight || '', onChange: (e) => setFormData({ ...formData, presentationWeight: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", placeholder: "1" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: "\uD83D\uDCE6 Unidades" }), _jsx("input", { type: "number", value: formData.unitsPurchased || '', onChange: (e) => setFormData({ ...formData, unitsPurchased: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", placeholder: "10" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: "\uD83D\uDCB0 Costo Total" }), _jsx("input", { type: "number", step: "100", value: formData.totalCost || '', onChange: (e) => setFormData({ ...formData, totalCost: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla", placeholder: "100000" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-xs font-semibold mb-1 block text-primary dark:text-vanilla", children: ["\uD83D\uDCE6 Stock Disponible (", formData.type === 'unid' ? 'unidades' : formData.type === 'kg' ? 'gramos' : 'mililitros', ")"] }), _jsx("input", { type: "number", step: "1", value: formData.stockQuantity || '', onChange: (e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) }), className: "w-full px-3 py-2 rounded-xl border-2 border-green-400/50 focus:border-green-500 bg-green-50/50 dark:bg-green-900/20 dark:border-green-600/40 text-lg font-medium text-primary dark:text-vanilla", placeholder: editingId ? 'Stock actual' : 'Se calcula automáticamente' }), _jsx("p", { className: "text-xs text-mocha/60 dark:text-latte/60 mt-1", children: editingId ? '💡 Modifica el stock actual del insumo' : '💡 Se calculará automáticamente al crear' })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(motion.button, { whileTap: { scale: 0.95 }, type: "submit", className: "flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-4 py-2 rounded-xl font-semibold transition text-lg shadow-warm", children: ["\u2705 ", editingId ? 'Actualizar' : 'Crear'] }), _jsx(motion.button, { whileTap: { scale: 0.95 }, type: "button", onClick: () => {
                                            setShowForm(false);
                                            setEditingId(null);
                                        }, className: "flex-1 bg-latte/40 hover:bg-latte/60 text-primary dark:text-vanilla px-4 py-2 rounded-xl font-semibold transition text-lg", children: "\u2715 Cancelar" })] })] }) })) }), _jsx("div", { className: "space-y-3", children: state.operations.length === 0 ? (_jsxs(motion.div, { className: "text-center py-12 text-mocha dark:text-latte", children: [_jsx("div", { className: "text-6xl mb-3", children: "\uD83D\uDED2" }), _jsx("p", { className: "font-semibold", children: "Inventario vac\u00EDo" }), _jsx("p", { className: "text-xs opacity-70", children: "Agrega insumos para gestionar costos" })] })) : (state.operations.map((op) => {
                    const costs = calculateCostPer(op);
                    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/80 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-primary dark:text-vanilla", children: op.name }), _jsxs("p", { className: "text-xs text-mocha/70 dark:text-latte/70", children: [op.presentationWeight, op.type, " \u00D7 ", op.unitsPurchased] })] }), _jsx("div", { className: "flex gap-2", children: canEdit && (_jsxs(_Fragment, { children: [_jsx(motion.button, { whileTap: { scale: 0.9 }, onClick: () => handleEdit(op), className: "bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-2 rounded-xl transition border border-caramel/20", children: _jsx(Edit2, { size: 16 }) }), _jsx(motion.button, { whileTap: { scale: 0.9 }, onClick: () => handleDelete(op.id), className: "bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-2 rounded-xl transition border border-blush/30", children: _jsx(Trash2, { size: 16 }) })] })) })] }), _jsx("div", { className: `mb-3 p-3 rounded-xl border ${op.stockQuantity > 0 ? 'bg-green-100/60 dark:bg-green-900/30 border-green-400/40' : 'bg-red-100/60 dark:bg-red-900/30 border-red-400/40'}`, children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: op.stockQuantity > 0 ? '📦' : '⚠️' }), _jsx("span", { className: `font-semibold text-sm ${op.stockQuantity > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`, children: "Stock Disponible" })] }), _jsx("span", { className: `font-bold text-lg ${op.stockQuantity > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`, children: op.type === 'unid'
                                                ? `${op.stockQuantity} unid`
                                                : op.stockQuantity >= 1000
                                                    ? `${(op.stockQuantity / 1000).toFixed(2)} ${op.type}`
                                                    : `${op.stockQuantity} ${op.type === 'kg' ? 'g' : 'ml'}` })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "glass-warm bg-peach/40 dark:bg-mocha/40 p-2 rounded-xl border border-caramel/25", children: [_jsx("p", { className: "text-primary dark:text-peach font-semibold", children: "$ / g" }), _jsx("p", { className: "font-bold text-lg text-primary dark:text-vanilla", children: formatCurrency(costs.perGram) })] }), _jsxs("div", { className: "glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl border border-honey/30", children: [_jsx("p", { className: "text-primary dark:text-honey font-semibold", children: "$ / 100g" }), _jsx("p", { className: "font-bold text-lg text-primary dark:text-vanilla", children: formatCurrency(costs.per100g) })] }), _jsxs("div", { className: "glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl border border-blush/30", children: [_jsx("p", { className: "text-primary dark:text-blush font-semibold", children: "$ / kg" }), _jsx("p", { className: "font-bold text-lg text-primary dark:text-vanilla", children: formatCurrency(costs.perKg) })] })] })] }, op.id));
                })) })] }));
};
// ============================================================================
// COSTS VIEW - Análisis de Costos y Rentabilidad
// ============================================================================
// ============================================================================
// COMPONENTE GRÁFICO DE BARRAS CSS
// ============================================================================
const BarChart = ({ data, maxValue, formatValue }) => (_jsx("div", { className: "space-y-3", children: data.map((item, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 }, children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { className: "font-medium text-primary dark:text-vanilla truncate max-w-[60%]", children: item.label }), _jsx("span", { className: "font-bold text-mocha/70 dark:text-latte/70", children: formatValue(item.value) })] }), _jsx("div", { className: "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${Math.min((item.value / maxValue) * 100, 100)}%` }, transition: { duration: 0.8, ease: 'easeOut', delay: i * 0.1 }, className: `h-full rounded-full ${item.color}` }) })] }, item.label))) }));
// ============================================================================
// COMPONENTE GRÁFICO CIRCULAR (DONUT) CSS
// ============================================================================
const DonutChart = ({ data, total, centerLabel }) => {
    let accumulatedPercent = 0;
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("div", { className: "relative", style: { width: size, height: size }, children: [_jsxs("svg", { width: size, height: size, className: "transform -rotate-90", children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, className: "text-slate-200 dark:text-slate-700" }), data.map((item, i) => {
                                const percent = total > 0 ? (item.value / total) * 100 : 0;
                                const dashArray = (percent / 100) * circumference;
                                accumulatedPercent += percent;
                                return (_jsx(motion.circle, { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, stroke: item.color, strokeDasharray: `${dashArray} ${circumference}`, strokeDashoffset: -((accumulatedPercent - percent) / 100) * circumference, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.2, duration: 0.5 }, strokeLinecap: "round" }, item.label));
                            })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsx("span", { className: "text-2xl font-bold text-primary dark:text-vanilla", children: centerLabel }), _jsx("span", { className: "text-xs text-mocha/60 dark:text-latte/60", children: "Total" })] })] }), _jsx("div", { className: "mt-4 grid grid-cols-2 gap-2 w-full", children: data.map((item) => (_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: item.color } }), _jsx("span", { className: "truncate text-mocha/70 dark:text-latte/70", children: item.label })] }, item.label))) })] }));
};
// ============================================================================
// COMPONENTE MINI SPARKLINE
// ============================================================================
const MiniSparkline = ({ values, color }) => {
    if (values.length === 0)
        return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const width = 80;
    const height = 30;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
    return (_jsxs("svg", { width: width, height: height, className: "overflow-visible", children: [_jsx("polyline", { fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", points: points }), _jsx("circle", { cx: width, cy: height - ((values[values.length - 1] - min) / range) * height, r: "3", fill: color })] }));
};
// ============================================================================
// SISTEMA DE GESTIÓN DE COSTOS - PANCITOS
// ============================================================================
const CostsView = () => {
    const state = useAppState();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    // Variables del simulador (solo se usan en esa pestaña)
    const [simMargin, setSimMargin] = useState(state.defaultMargin || 40);
    const [simQuantity, setSimQuantity] = useState(10);
    const [simRecipeId, setSimRecipeId] = useState(null);
    // Formatear moneda colombiana COP
    const formatCOP = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    // =========================================================================
    // CÁLCULOS AUTOMÁTICOS GLOBALES (Solo costos reales, sin margen)
    // =========================================================================
    const globalStats = React.useMemo(() => {
        // Inventario
        const totalInventoryValue = state.operations.reduce((sum, op) => sum + op.totalCost, 0);
        const totalItems = state.operations.length;
        // Top 5 ingredientes más costosos
        const sortedOps = [...state.operations].sort((a, b) => b.totalCost - a.totalCost);
        const top5Ingredients = sortedOps.slice(0, 5);
        // Calcular costo de cada receta (SOLO COSTOS, sin margen)
        const recipeCosts = state.recipes.map(recipe => {
            let totalCost = 0;
            let availableCount = 0;
            recipe.ingredients.forEach(ing => {
                const op = state.operations.find(o => normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
                    normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
                    normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name)));
                if (op) {
                    const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
                    const costPerGram = op.totalCost / totalGrams;
                    const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                    totalCost += costPerGram * ingGrams;
                    availableCount++;
                }
            });
            return {
                ...recipe,
                totalCost,
                availableIngredients: availableCount,
                totalIngredients: recipe.ingredients.length,
                completeness: recipe.ingredients.length > 0 ? (availableCount / recipe.ingredients.length) * 100 : 0,
            };
        });
        // Rankings por costo
        const sortedByCost = [...recipeCosts].sort((a, b) => b.totalCost - a.totalCost);
        const mostExpensive = sortedByCost.slice(0, 3);
        const cheapest = [...recipeCosts].sort((a, b) => a.totalCost - b.totalCost).slice(0, 3);
        // Margen de ganancia desde configuración del usuario
        const defaultMargin = state.defaultMargin || 40;
        // Agregar ganancia a cada receta
        const recipeCostsWithProfit = recipeCosts.map(r => ({
            ...r,
            suggestedPrice: r.totalCost * (1 + defaultMargin / 100),
            profit: r.totalCost * (defaultMargin / 100),
            margin: defaultMargin,
        }));
        // Rankings por ganancia
        const sortedByProfit = [...recipeCostsWithProfit].sort((a, b) => b.profit - a.profit);
        const mostProfitable = sortedByProfit.slice(0, 3);
        // Totales
        const avgCost = recipeCostsWithProfit.length > 0 ? recipeCostsWithProfit.reduce((s, r) => s + r.totalCost, 0) / recipeCostsWithProfit.length : 0;
        const totalCostAll = recipeCostsWithProfit.reduce((s, r) => s + r.totalCost, 0);
        const minCost = recipeCostsWithProfit.length > 0 ? Math.min(...recipeCostsWithProfit.map(r => r.totalCost)) : 0;
        const maxCost = recipeCostsWithProfit.length > 0 ? Math.max(...recipeCostsWithProfit.map(r => r.totalCost)) : 0;
        // Totales de ganancias
        const totalProfit = recipeCostsWithProfit.reduce((s, r) => s + r.profit, 0);
        const avgProfit = recipeCostsWithProfit.length > 0 ? totalProfit / recipeCostsWithProfit.length : 0;
        const totalRevenue = recipeCostsWithProfit.reduce((s, r) => s + r.suggestedPrice, 0);
        // Por categoría
        const byCategory = {
            'Panadería': recipeCostsWithProfit.filter(r => r.category === 'Panadería'),
            'Pastelería': recipeCostsWithProfit.filter(r => r.category === 'Pastelería'),
        };
        const categoryStats = Object.entries(byCategory).map(([cat, recipes]) => ({
            category: cat,
            count: recipes.length,
            totalCost: recipes.reduce((s, r) => s + r.totalCost, 0),
            avgCost: recipes.length > 0 ? recipes.reduce((s, r) => s + r.totalCost, 0) / recipes.length : 0,
            totalProfit: recipes.reduce((s, r) => s + r.profit, 0),
            avgProfit: recipes.length > 0 ? recipes.reduce((s, r) => s + r.profit, 0) / recipes.length : 0,
        }));
        return {
            totalInventoryValue,
            totalItems,
            top5Ingredients,
            recipeCosts: recipeCostsWithProfit,
            mostExpensive,
            cheapest,
            mostProfitable,
            avgCost,
            totalCostAll,
            minCost,
            maxCost,
            totalProfit,
            avgProfit,
            totalRevenue,
            defaultMargin,
            categoryStats,
            totalRecipes: state.recipes.length,
        };
    }, [state.operations, state.recipes, state.defaultMargin]);
    // Cálculo detallado de receta seleccionada (solo costos base)
    const selectedRecipeAnalysis = React.useMemo(() => {
        const recipe = state.recipes.find(r => r.id === selectedRecipeId);
        if (!recipe)
            return null;
        const ingredients = [];
        let totalCost = 0;
        recipe.ingredients.forEach(ing => {
            const op = state.operations.find(o => normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name)));
            if (op) {
                const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
                const costPerGram = op.totalCost / totalGrams;
                const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                const cost = costPerGram * ingGrams;
                ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost, percent: 0, available: true });
                totalCost += cost;
            }
            else {
                ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost: 0, percent: 0, available: false });
            }
        });
        // Calcular porcentajes
        ingredients.forEach(ing => {
            if (ing.available && totalCost > 0)
                ing.percent = (ing.cost / totalCost) * 100;
        });
        ingredients.sort((a, b) => b.cost - a.cost);
        return { recipe, ingredients, totalCost };
    }, [selectedRecipeId, state.recipes, state.operations]);
    // Cálculo del simulador (con margen personalizado)
    const simulatorData = React.useMemo(() => {
        const recipe = state.recipes.find(r => r.id === simRecipeId);
        if (!recipe)
            return null;
        let totalCost = 0;
        const ingredients = [];
        recipe.ingredients.forEach(ing => {
            const op = state.operations.find(o => normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name)));
            if (op) {
                const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
                const costPerGram = op.totalCost / totalGrams;
                const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                const cost = costPerGram * ingGrams;
                ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost, available: true });
                totalCost += cost;
            }
            else {
                ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost: 0, available: false });
            }
        });
        const costPerUnit = totalCost;
        const pricePerUnit = costPerUnit * (1 + simMargin / 100);
        const profitPerUnit = pricePerUnit - costPerUnit;
        const totalInvestment = costPerUnit * simQuantity;
        const totalRevenue = pricePerUnit * simQuantity;
        const totalProfit = profitPerUnit * simQuantity;
        return { recipe, ingredients, costPerUnit, pricePerUnit, profitPerUnit, totalInvestment, totalRevenue, totalProfit };
    }, [simRecipeId, state.recipes, state.operations, simMargin, simQuantity]);
    // =========================================================================
    // TABS DE NAVEGACIÓN
    // =========================================================================
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'analysis', label: 'Análisis', icon: '🔍' },
        { id: 'simulator', label: 'Simulador', icon: '🧮' },
        { id: 'reports', label: 'Reportes', icon: '📋' },
    ];
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4 pb-24", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 p-5 rounded-2xl border border-emerald-400/30 shadow-warm overflow-hidden relative", children: [_jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-50" }), _jsxs("div", { className: "relative flex items-center gap-4", children: [_jsx("div", { className: "bg-white/20 p-4 rounded-2xl backdrop-blur-sm", children: _jsx(TrendingUp, { size: 36, className: "text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-2xl font-bold text-white flex items-center gap-2", children: "\uD83D\uDCB0 Sistema de Gesti\u00F3n de Costos" }), _jsx("p", { className: "text-emerald-100/80 text-sm mt-1", children: "PANCITOS \u00B7 Panel de Control Financiero" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-3xl font-bold text-white", children: globalStats.totalRecipes }), _jsx("p", { className: "text-xs text-emerald-100/70", children: "recetas" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-3xl font-bold text-white", children: globalStats.totalItems }), _jsx("p", { className: "text-xs text-emerald-100/70", children: "insumos" })] })] })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: tabs.map(tab => (_jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : 'bg-cream/80 dark:bg-mocha/50 text-mocha/70 dark:text-latte/70 hover:bg-cream dark:hover:bg-mocha/70'}`, children: [_jsx("span", { children: tab.icon }), tab.label] }, tab.id))) }), activeTab === 'dashboard' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/40 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCE6" }), _jsx(MiniSparkline, { values: [30, 45, 28, 50, 42, 65], color: "#3b82f6" })] }), _jsx("p", { className: "text-xs text-blue-600 dark:text-blue-300 font-semibold mt-2", children: "Inventario Total" }), _jsx("p", { className: "text-xl font-bold text-blue-800 dark:text-blue-100", children: formatCOP(globalStats.totalInventoryValue) }), _jsxs("p", { className: "text-xs text-blue-500/70 dark:text-blue-400/70", children: [globalStats.totalItems, " insumos"] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 border-2 border-purple-200/50 dark:border-purple-700/40 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCD6" }), _jsx(MiniSparkline, { values: [20, 35, 40, 38, 45, 50], color: "#a855f7" })] }), _jsx("p", { className: "text-xs text-purple-600 dark:text-purple-300 font-semibold mt-2", children: "Total Recetas" }), _jsx("p", { className: "text-xl font-bold text-purple-800 dark:text-purple-100", children: globalStats.totalRecipes }), _jsx("p", { className: "text-xs text-purple-500/70 dark:text-purple-400/70", children: "Con an\u00E1lisis de costos" })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/30 border-2 border-amber-200/50 dark:border-amber-700/40 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCB5" }), _jsx(MiniSparkline, { values: [40, 55, 48, 60, 52, 70], color: "#f59e0b" })] }), _jsx("p", { className: "text-xs text-amber-600 dark:text-amber-300 font-semibold mt-2", children: "Costo Promedio" }), _jsx("p", { className: "text-xl font-bold text-amber-800 dark:text-amber-100", children: formatCOP(globalStats.avgCost) }), _jsx("p", { className: "text-xs text-amber-500/70 dark:text-amber-400/70", children: "Por receta" })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30 border-2 border-green-200/50 dark:border-green-700/40 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCC8" }), _jsx(MiniSparkline, { values: [50, 65, 58, 75, 68, 85], color: "#22c55e" })] }), _jsx("p", { className: "text-xs text-green-600 dark:text-green-300 font-semibold mt-2", children: "Ganancia Total" }), _jsx("p", { className: "text-xl font-bold text-green-800 dark:text-green-100", children: formatCOP(globalStats.totalProfit) }), _jsxs("p", { className: "text-xs text-green-500/70 dark:text-green-400/70", children: ["Margen ", globalStats.defaultMargin, "%"] })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-r from-green-500/90 via-emerald-500/90 to-teal-500/90 dark:from-green-800 dark:via-emerald-800 dark:to-teal-800 rounded-2xl p-5 shadow-warm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDCB0" }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Resumen de Ganancias" }), _jsxs("p", { className: "text-white/70 text-xs", children: ["Margen autom\u00E1tico del ", globalStats.defaultMargin, "% sobre costo"] })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83D\uDCE6 Costo Total" }), _jsx("p", { className: "text-xl font-bold text-white", children: formatCOP(globalStats.totalCostAll) })] }), _jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83C\uDFF7\uFE0F Venta Total" }), _jsx("p", { className: "text-xl font-bold text-white", children: formatCOP(globalStats.totalRevenue) })] }), _jsxs("div", { className: "bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40", children: [_jsx("p", { className: "text-white/80 text-xs mb-1", children: "\uD83D\uDCB5 Ganancia Total" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(globalStats.totalProfit) })] }), _jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83D\uDCCA Ganancia Prom." }), _jsx("p", { className: "text-xl font-bold text-white", children: formatCOP(globalStats.avgProfit) })] })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-2xl p-5 shadow-warm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDCCA" }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Resumen de Costos" }), _jsx("p", { className: "text-white/70 text-xs", children: "An\u00E1lisis autom\u00E1tico basado en tu inventario" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83D\uDCC9 Costo M\u00EDnimo" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(globalStats.minCost) }), _jsx("p", { className: "text-white/50 text-xs mt-1", children: "Receta m\u00E1s econ\u00F3mica" })] }), _jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83D\uDCCA Costo Promedio" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(globalStats.avgCost) }), _jsxs("p", { className: "text-white/50 text-xs mt-1", children: ["De ", globalStats.totalRecipes, " recetas"] })] }), _jsxs("div", { className: "bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40", children: [_jsx("p", { className: "text-white/80 text-xs mb-1", children: "\uD83D\uDCC8 Costo M\u00E1ximo" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(globalStats.maxCost) }), _jsx("p", { className: "text-white/60 text-xs mt-1", children: "Receta m\u00E1s costosa" })] })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/70 rounded-2xl p-5 border-2 border-slate-200/50 dark:border-slate-700/40", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-3xl", children: "\u2699\uFE0F" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-primary dark:text-vanilla text-lg", children: "Configuraci\u00F3n del Margen" }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-400", children: "Ajusta el porcentaje de ganancia para todos los c\u00E1lculos" })] })] }), _jsxs("div", { className: "bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-4", children: [_jsx("p", { className: "text-sm text-blue-800 dark:text-blue-200 font-medium mb-2", children: "\uD83D\uDCA1 \u00BFQu\u00E9 es el margen de ganancia?" }), _jsxs("p", { className: "text-xs text-blue-700 dark:text-blue-300 leading-relaxed", children: ["El ", _jsx("strong", { children: "margen de ganancia" }), " es el porcentaje que agregas sobre el costo de producci\u00F3n para obtener tu precio de venta. Por ejemplo, si tu pan cuesta ", _jsx("strong", { children: "$1,000" }), " producirlo y usas un margen del ", _jsx("strong", { children: "40%" }), ", el precio sugerido ser\u00EDa ", _jsx("strong", { children: "$1,400" }), " (ganancia de $400).", _jsx("br", {}), _jsx("br", {}), _jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\uD83D\uDCCC Recomendaciones t\u00EDpicas:" }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "30-40%" }), ": Productos b\u00E1sicos (pan tradicional, bollos)", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "50-70%" }), ": Pasteler\u00EDa y productos especiales", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "80-100%+" }), ": Productos artesanales premium o personalizados"] })] }), _jsxs("div", { className: "flex flex-col md:flex-row items-center gap-4", children: [_jsxs("div", { className: "flex-1 w-full", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("label", { className: "text-sm font-semibold text-primary dark:text-vanilla", children: "\uD83D\uDCC8 Margen Predeterminado:" }), _jsxs("span", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: [state.defaultMargin, "%"] })] }), _jsx("input", { type: "range", min: "0", max: "200", value: state.defaultMargin, onChange: (e) => state.setDefaultMargin(Number(e.target.value)), className: "w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 dark:from-red-800 dark:via-yellow-800 dark:to-green-800 rounded-lg appearance-none cursor-pointer accent-green-600" }), _jsxs("div", { className: "flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1", children: [_jsx("span", { children: "0%" }), _jsx("span", { children: "50%" }), _jsx("span", { children: "100%" }), _jsx("span", { children: "150%" }), _jsx("span", { children: "200%" })] })] }), _jsxs("div", { className: "flex-shrink-0 bg-green-100 dark:bg-green-900/40 border-2 border-green-300 dark:border-green-600 rounded-xl px-6 py-3 text-center", children: [_jsx("p", { className: "text-xs text-green-700 dark:text-green-300 font-medium", children: "Precio de ejemplo" }), _jsx("p", { className: "text-sm text-green-600 dark:text-green-400", children: "Costo: $10,000" }), _jsxs("p", { className: "text-lg font-bold text-green-700 dark:text-green-200", children: ["Venta: ", formatCOP(10000 * (1 + state.defaultMargin / 100))] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: "card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5", children: [_jsx("h3", { className: "font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2", children: "\uD83E\uDD47 Top 5 Insumos M\u00E1s Costosos" }), _jsx(BarChart, { data: globalStats.top5Ingredients.map((op, i) => ({
                                            label: op.name,
                                            value: op.totalCost,
                                            color: ['bg-gradient-to-r from-red-400 to-red-500', 'bg-gradient-to-r from-orange-400 to-orange-500', 'bg-gradient-to-r from-amber-400 to-amber-500', 'bg-gradient-to-r from-yellow-400 to-yellow-500', 'bg-gradient-to-r from-lime-400 to-lime-500'][i],
                                        })), maxValue: globalStats.top5Ingredients[0]?.totalCost || 1, formatValue: formatCOP })] }), _jsxs("div", { className: "card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5", children: [_jsx("h3", { className: "font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2", children: "\uD83E\uDD67 Ganancias por Categor\u00EDa" }), _jsx("div", { className: "flex justify-center", children: _jsx(DonutChart, { data: globalStats.categoryStats.map((cat, i) => ({
                                                label: `${cat.category} (${cat.count})`,
                                                value: cat.totalProfit,
                                                color: ['#22c55e', '#10b981'][i],
                                            })), total: globalStats.categoryStats.reduce((s, c) => s + c.totalProfit, 0), centerLabel: formatCOP(globalStats.categoryStats.reduce((s, c) => s + c.totalProfit, 0)) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-700/40 rounded-2xl p-4", children: [_jsx("h3", { className: "font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2", children: "\uD83C\uDFC6 M\u00E1s Rentables" }), _jsx("div", { className: "space-y-2", children: globalStats.mostProfitable.map((r, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 }, className: "flex items-center gap-3 bg-white/60 dark:bg-green-900/30 p-3 rounded-xl", children: [_jsx("span", { className: "text-2xl", children: ['🥇', '🥈', '🥉'][i] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-sm text-green-900 dark:text-green-100 truncate", children: r.name }), _jsx("p", { className: "text-xs text-green-600/70 dark:text-green-400/70", children: r.category })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-green-700 dark:text-green-300", children: formatCOP(r.profit) }), _jsx("p", { className: "text-xs text-green-500/70 dark:text-green-400/70", children: "ganancia" })] })] }, r.id))) })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/20 border-2 border-red-200/50 dark:border-red-700/40 rounded-2xl p-4", children: [_jsx("h3", { className: "font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2", children: "\uD83D\uDCB8 M\u00E1s Costosas" }), _jsx("div", { className: "space-y-2", children: globalStats.mostExpensive.map((r, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 }, className: "flex items-center gap-3 bg-white/60 dark:bg-red-900/30 p-3 rounded-xl", children: [_jsx("span", { className: "text-2xl", children: ['🥇', '🥈', '🥉'][i] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-sm text-red-900 dark:text-red-100 truncate", children: r.name }), _jsx("p", { className: "text-xs text-red-600/70 dark:text-red-400/70", children: r.category })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-red-700 dark:text-red-300", children: formatCOP(r.totalCost) }), _jsx("p", { className: "text-xs text-red-500/70 dark:text-red-400/70", children: "costo" })] })] }, r.id))) })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 border-2 border-blue-200/50 dark:border-blue-700/40 rounded-2xl p-4", children: [_jsx("h3", { className: "font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2", children: "\uD83D\uDCB0 M\u00E1s Econ\u00F3micas" }), _jsx("div", { className: "space-y-2", children: globalStats.cheapest.map((r, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 }, className: "flex items-center gap-3 bg-white/60 dark:bg-blue-900/30 p-3 rounded-xl", children: [_jsx("span", { className: "text-2xl", children: ['1️⃣', '2️⃣', '3️⃣'][i] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-sm text-blue-900 dark:text-blue-100 truncate", children: r.name }), _jsx("p", { className: "text-xs text-blue-600/70 dark:text-blue-400/70", children: r.category })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-blue-700 dark:text-blue-300", children: formatCOP(r.totalCost) }), _jsx("p", { className: "text-xs text-blue-500/70 dark:text-blue-400/70", children: "costo" })] })] }, r.id))) })] })] })] })), activeTab === 'analysis' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "glass-warm bg-cream/90 dark:bg-mocha/60 p-4 rounded-2xl border border-caramel/30", children: [_jsx("label", { className: "text-sm font-bold mb-3 block text-primary dark:text-vanilla", children: "\uD83D\uDD0D Selecciona una receta para an\u00E1lisis detallado" }), _jsxs("select", { value: selectedRecipeId || '', onChange: (e) => setSelectedRecipeId(e.target.value || null), className: "w-full px-4 py-3 rounded-2xl border-2 border-emerald-300/50 focus:border-emerald-500 bg-white dark:bg-mocha/40 text-lg font-medium text-primary dark:text-vanilla", children: [_jsx("option", { value: "", children: "-- Elige una receta --" }), state.recipes.map((r) => (_jsxs("option", { value: r.id, children: [r.name, " \u2022 ", r.category] }, r.id)))] })] }), selectedRecipeAnalysis && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4", children: [_jsx("div", { className: "glass-warm bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/60 p-5 rounded-2xl border border-caramel/30", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xl text-primary dark:text-vanilla", children: selectedRecipeAnalysis.recipe.name }), _jsxs("p", { className: "text-sm text-mocha/60 dark:text-latte/60", children: [selectedRecipeAnalysis.recipe.category, " \u2022 ", selectedRecipeAnalysis.recipe.ingredients.length, " ingredientes"] })] }), _jsxs("div", { className: "flex gap-4 text-center", children: [_jsxs("div", { className: "bg-white/60 dark:bg-mocha/40 px-4 py-2 rounded-xl", children: [_jsx("p", { className: "text-xl", children: "\uD83C\uDF21\uFE0F" }), _jsxs("p", { className: "font-bold text-primary dark:text-vanilla", children: [selectedRecipeAnalysis.recipe.temperature, "\u00B0C"] })] }), _jsxs("div", { className: "bg-white/60 dark:bg-mocha/40 px-4 py-2 rounded-xl", children: [_jsx("p", { className: "text-xl", children: "\u23F1\uFE0F" }), _jsxs("p", { className: "font-bold text-primary dark:text-vanilla", children: [selectedRecipeAnalysis.recipe.time, " min"] })] })] })] }) }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700/40 rounded-2xl p-6 text-center", children: [_jsx("p", { className: "text-sm text-amber-600 dark:text-amber-300 font-semibold", children: "\uD83D\uDCE6 Costo Base de la Receta" }), _jsx("p", { className: "text-4xl font-bold text-amber-700 dark:text-amber-200 mt-2", children: formatCOP(selectedRecipeAnalysis.totalCost) }), _jsx("p", { className: "text-xs text-amber-500/70 dark:text-amber-400/70 mt-2", children: "Calculado con precios actuales del inventario" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: "card-vintage bg-gradient-to-br from-white to-amber-50/50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-caramel/30 rounded-2xl p-5", children: [_jsx("h4", { className: "font-bold text-primary dark:text-vanilla mb-4", children: "\uD83D\uDCCA Distribuci\u00F3n de Costos" }), _jsx(DonutChart, { data: selectedRecipeAnalysis.ingredients.filter(i => i.available).slice(0, 6).map((ing, i) => ({
                                                    label: ing.name,
                                                    value: ing.cost,
                                                    color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][i],
                                                })), total: selectedRecipeAnalysis.totalCost, centerLabel: formatCOP(selectedRecipeAnalysis.totalCost) })] }), _jsxs("div", { className: "card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5", children: [_jsx("h4", { className: "font-bold text-primary dark:text-vanilla mb-4", children: "\uD83D\uDCCB Desglose por Ingrediente" }), _jsx("div", { className: "space-y-3 max-h-64 overflow-y-auto", children: selectedRecipeAnalysis.ingredients.map((ing, i) => (_jsxs("div", { className: `${!ing.available ? 'opacity-50' : ''}`, children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsxs("span", { className: `flex items-center gap-2 ${ing.available ? 'text-primary dark:text-vanilla' : 'text-red-500'}`, children: [ing.available ? '✓' : '✗', " ", ing.name, _jsxs("span", { className: "text-xs text-mocha/50 dark:text-latte/50", children: ["(", ing.qty, " ", ing.unit, ")"] })] }), _jsx("span", { className: "font-bold", children: ing.available ? formatCOP(ing.cost) : 'Sin precio' })] }), ing.available && (_jsx("div", { className: "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${ing.percent}%` }, className: "h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full", transition: { duration: 0.6, delay: i * 0.05 } }) }))] }, ing.name))) })] })] })] })), !selectedRecipeAnalysis && (_jsxs("div", { className: "text-center py-12", children: [_jsx("span", { className: "text-6xl", children: "\uD83D\uDD0D" }), _jsx("h3", { className: "text-xl font-bold text-mocha/70 dark:text-latte/70 mt-4", children: "Selecciona una receta" }), _jsx("p", { className: "text-sm text-mocha/50 dark:text-latte/50", children: "Para ver el an\u00E1lisis detallado de costos" })] }))] })), activeTab === 'simulator' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/30 p-5 rounded-2xl border border-indigo-300/50", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83E\uDDEE" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-indigo-800 dark:text-indigo-200 text-lg", children: "Simulador de Producci\u00F3n y Precios" }), _jsx("p", { className: "text-xs text-indigo-600/70 dark:text-indigo-400/70", children: "Proyecta ganancias ajustando margen y cantidad" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block", children: "\uD83D\uDCD6 Receta" }), _jsxs("select", { value: simRecipeId || '', onChange: (e) => setSimRecipeId(e.target.value || null), className: "w-full px-4 py-3 rounded-xl border-2 border-indigo-300/50 focus:border-indigo-500 bg-white dark:bg-indigo-900/30 text-primary dark:text-vanilla", children: [_jsx("option", { value: "", children: "-- Selecciona una receta --" }), state.recipes.map((r) => (_jsxs("option", { value: r.id, children: [r.name, " \u2022 ", r.category] }, r.id)))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block", children: ["\uD83D\uDCC8 Margen de Ganancia: ", simMargin, "%"] }), _jsx("input", { type: "range", min: "0", max: "150", value: simMargin, onChange: (e) => setSimMargin(Number(e.target.value)), className: "w-full h-3 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" }), _jsxs("div", { className: "flex justify-between text-xs text-indigo-500/70 dark:text-indigo-400/70 mt-1", children: [_jsx("span", { children: "0%" }), _jsx("span", { children: "75%" }), _jsx("span", { children: "150%" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block", children: "\uD83D\uDCE6 Cantidad a Producir" }), _jsx("input", { type: "number", value: simQuantity, onChange: (e) => setSimQuantity(Math.max(1, Number(e.target.value))), min: "1", className: "w-full px-4 py-3 rounded-xl border-2 border-indigo-300/50 focus:border-indigo-500 bg-white dark:bg-indigo-900/30 text-primary dark:text-vanilla text-center font-bold text-lg" })] })] })] }), simulatorData ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4", children: [_jsx("div", { className: "glass-warm bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/60 p-4 rounded-2xl border border-caramel/30", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-4xl", children: simulatorData.recipe.category === 'Panadería' ? '🍞' : '🍰' }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xl text-primary dark:text-vanilla", children: simulatorData.recipe.name }), _jsxs("p", { className: "text-sm text-mocha/60 dark:text-latte/60", children: [simulatorData.recipe.category, " \u2022 ", simulatorData.recipe.ingredients.length, " ingredientes"] })] })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700/40 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-red-600 dark:text-red-300 font-semibold", children: "\uD83D\uDCE6 Costo por Unidad" }), _jsx("p", { className: "text-2xl font-bold text-red-700 dark:text-red-200 mt-1", children: formatCOP(simulatorData.costPerUnit) })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-amber-600 dark:text-amber-300 font-semibold", children: "\uD83C\uDFF7\uFE0F Precio Sugerido" }), _jsx("p", { className: "text-2xl font-bold text-amber-700 dark:text-amber-200 mt-1", children: formatCOP(simulatorData.pricePerUnit) })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700/40 rounded-2xl p-4 text-center", children: [_jsx("p", { className: "text-xs text-green-600 dark:text-green-300 font-semibold", children: "\uD83D\uDCB5 Ganancia por Unidad" }), _jsx("p", { className: "text-2xl font-bold text-green-700 dark:text-green-200 mt-1", children: formatCOP(simulatorData.profitPerUnit) })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-2xl p-5 shadow-warm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83C\uDFED" }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Proyecci\u00F3n de Producci\u00F3n" }), _jsxs("p", { className: "text-white/70 text-xs", children: [simQuantity, " unidades \u00D7 ", simulatorData.recipe.name] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83D\uDCB0 Inversi\u00F3n Total" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(simulatorData.totalInvestment) })] }), _jsxs("div", { className: "bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20", children: [_jsx("p", { className: "text-white/70 text-xs mb-1", children: "\uD83C\uDFF7\uFE0F Venta Proyectada" }), _jsx("p", { className: "text-2xl font-bold text-white", children: formatCOP(simulatorData.totalRevenue) })] }), _jsxs("div", { className: "bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40", children: [_jsx("p", { className: "text-white/80 text-xs mb-1", children: "\uD83D\uDCB5 GANANCIA TOTAL" }), _jsx("p", { className: "text-3xl font-bold text-white", children: formatCOP(simulatorData.totalProfit) }), _jsxs("p", { className: "text-white/60 text-xs mt-1", children: ["Margen ", simMargin, "%"] })] })] })] }), _jsxs("div", { className: "card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5", children: [_jsxs("h4", { className: "font-bold text-primary dark:text-vanilla mb-4", children: ["\uD83D\uDCCB Costo por Ingrediente (x", simQuantity, " unidades)"] }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: simulatorData.ingredients.map((ing) => (_jsxs("div", { className: `flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 ${!ing.available ? 'opacity-50' : ''}`, children: [_jsxs("span", { className: `flex items-center gap-2 text-sm ${ing.available ? 'text-primary dark:text-vanilla' : 'text-red-500'}`, children: [ing.available ? '✓' : '✗', " ", ing.name, _jsxs("span", { className: "text-xs text-mocha/50 dark:text-latte/50", children: ["(", ing.qty * simQuantity, " ", ing.unit, ")"] })] }), _jsx("span", { className: "font-bold text-sm", children: ing.available ? formatCOP(ing.cost * simQuantity) : 'N/A' })] }, ing.name))) })] })] })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx("span", { className: "text-6xl", children: "\uD83E\uDDEE" }), _jsx("h3", { className: "text-xl font-bold text-mocha/70 dark:text-latte/70 mt-4", children: "Selecciona una receta" }), _jsx("p", { className: "text-sm text-mocha/50 dark:text-latte/50", children: "Para simular la producci\u00F3n y calcular ganancias" })] }))] })), activeTab === 'reports' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("div", { className: "glass-warm bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-700/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-600", children: [_jsx("h3", { className: "font-bold text-lg text-primary dark:text-vanilla mb-4 flex items-center gap-2", children: "\uD83D\uDCCB Reporte Ejecutivo - PANCITOS" }), _jsxs("div", { className: "text-xs text-mocha/50 dark:text-latte/50 mb-4", children: ["Generado: ", new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center", children: [_jsx("p", { className: "text-xs text-mocha/60 dark:text-latte/60", children: "Total Recetas" }), _jsx("p", { className: "text-2xl font-bold text-primary dark:text-vanilla", children: globalStats.totalRecipes })] }), _jsxs("div", { className: "bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center", children: [_jsx("p", { className: "text-xs text-mocha/60 dark:text-latte/60", children: "Insumos" }), _jsx("p", { className: "text-2xl font-bold text-primary dark:text-vanilla", children: globalStats.totalItems })] }), _jsxs("div", { className: "bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center", children: [_jsx("p", { className: "text-xs text-mocha/60 dark:text-latte/60", children: "Valor Inventario" }), _jsx("p", { className: "text-lg font-bold text-blue-600 dark:text-blue-400", children: formatCOP(globalStats.totalInventoryValue) })] }), _jsxs("div", { className: "bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center", children: [_jsx("p", { className: "text-xs text-mocha/60 dark:text-latte/60", children: "Costo Total" }), _jsx("p", { className: "text-lg font-bold text-amber-600 dark:text-amber-400", children: formatCOP(globalStats.totalCostAll) })] }), _jsxs("div", { className: "bg-green-100/70 dark:bg-green-900/40 p-3 rounded-xl text-center", children: [_jsx("p", { className: "text-xs text-green-700 dark:text-green-300", children: "Ganancia Total" }), _jsx("p", { className: "text-lg font-bold text-green-600 dark:text-green-400", children: formatCOP(globalStats.totalProfit) })] })] }), _jsx("h4", { className: "font-semibold text-primary dark:text-vanilla mb-3", children: "Resumen por Categor\u00EDa" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b-2 border-slate-200 dark:border-slate-600", children: [_jsx("th", { className: "text-left py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Categor\u00EDa" }), _jsx("th", { className: "text-center py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Recetas" }), _jsx("th", { className: "text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Costo Prom." }), _jsx("th", { className: "text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Costo Total" }), _jsx("th", { className: "text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Ganancia Prom." }), _jsx("th", { className: "text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold", children: "Ganancia Total" })] }) }), _jsx("tbody", { children: globalStats.categoryStats.map(cat => (_jsxs("tr", { className: "border-b border-slate-100 dark:border-slate-700", children: [_jsx("td", { className: "py-2 font-medium text-primary dark:text-vanilla", children: cat.category }), _jsx("td", { className: "py-2 text-center", children: cat.count }), _jsx("td", { className: "py-2 text-right text-amber-600 dark:text-amber-400", children: formatCOP(cat.avgCost) }), _jsx("td", { className: "py-2 text-right text-red-600 dark:text-red-400", children: formatCOP(cat.totalCost) }), _jsx("td", { className: "py-2 text-right text-green-600 dark:text-green-400", children: formatCOP(cat.avgProfit) }), _jsx("td", { className: "py-2 text-right font-bold text-green-700 dark:text-green-300", children: formatCOP(cat.totalProfit) })] }, cat.category))) })] }) }), _jsxs("div", { className: "mt-6 p-4 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700", children: [_jsxs("h4", { className: "font-semibold text-green-800 dark:text-green-200 mb-2", children: ["\uD83D\uDCB0 Resumen de Ganancias (Margen ", globalStats.defaultMargin, "%)"] }), _jsxs("div", { className: "grid grid-cols-4 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-600/70 dark:text-green-400/70", children: "Costo Total" }), _jsx("p", { className: "text-lg font-bold text-green-800 dark:text-green-200", children: formatCOP(globalStats.totalCostAll) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-600/70 dark:text-green-400/70", children: "Venta Total" }), _jsx("p", { className: "text-lg font-bold text-green-800 dark:text-green-200", children: formatCOP(globalStats.totalRevenue) })] }), _jsxs("div", { className: "bg-green-200/50 dark:bg-green-800/30 rounded-xl p-2", children: [_jsx("p", { className: "text-xs text-green-700 dark:text-green-300", children: "Ganancia Total" }), _jsx("p", { className: "text-xl font-bold text-green-800 dark:text-green-100", children: formatCOP(globalStats.totalProfit) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-600/70 dark:text-green-400/70", children: "Ganancia Prom." }), _jsx("p", { className: "text-lg font-bold text-green-800 dark:text-green-200", children: formatCOP(globalStats.avgProfit) })] })] })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-700", children: [_jsx("h3", { className: "font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2", children: "\uD83D\uDCA1 Recomendaciones" }), _jsxs("ul", { className: "space-y-2 text-sm text-amber-700 dark:text-amber-300", children: [globalStats.recipeCosts.some(r => r.completeness < 100) && (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: "Hay recetas con ingredientes sin costear. Agrega los insumos faltantes al inventario para mayor precisi\u00F3n." })] })), globalStats.mostProfitable[0] && (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { children: "\uD83C\uDFC6" }), _jsxs("span", { children: ["La receta m\u00E1s rentable es ", _jsx("strong", { children: globalStats.mostProfitable[0].name }), " con ", formatCOP(globalStats.mostProfitable[0].profit), " de ganancia."] })] })), globalStats.cheapest[0] && (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { children: "\uD83D\uDCB0" }), _jsxs("span", { children: ["La receta m\u00E1s econ\u00F3mica es ", _jsx("strong", { children: globalStats.cheapest[0].name }), " con ", formatCOP(globalStats.cheapest[0].totalCost), " de costo."] })] })), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { children: "\uD83E\uDDEE" }), _jsxs("span", { children: ["Usa el ", _jsx("strong", { children: "Simulador" }), " para calcular precios de venta y proyectar ganancias con diferentes m\u00E1rgenes."] })] })] })] }), _jsxs("div", { className: "glass-warm bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-700/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-600", children: [_jsxs("h3", { className: "font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2", children: ["\uD83D\uDCD6 Detalle por Receta (Margen ", globalStats.defaultMargin, "%)"] }), _jsx("div", { className: "space-y-2", children: globalStats.recipeCosts.map((recipe) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/30 rounded-xl", children: [_jsx("span", { className: "text-2xl", children: recipe.category === 'Panadería' ? '🍞' : '🍰' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-sm text-primary dark:text-vanilla truncate", children: recipe.name }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-mocha/50 dark:text-latte/50", children: [_jsx("span", { children: recipe.category }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: recipe.completeness >= 80 ? 'text-green-600' : recipe.completeness >= 50 ? 'text-amber-600' : 'text-red-600', children: [recipe.completeness.toFixed(0), "% costeado"] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-right", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-red-500/70", children: "Costo" }), _jsx("p", { className: "font-bold text-red-600 dark:text-red-400 text-sm", children: formatCOP(recipe.totalCost) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-amber-500/70", children: "Precio" }), _jsx("p", { className: "font-bold text-amber-600 dark:text-amber-400 text-sm", children: formatCOP(recipe.suggestedPrice) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-500/70", children: "Ganancia" }), _jsx("p", { className: "font-bold text-green-600 dark:text-green-400 text-sm", children: formatCOP(recipe.profit) })] })] })] }, recipe.id))) })] })] }))] }));
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
// ============================================================================
// DARK MODE HOOK
// ============================================================================
const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('pancitos-dark-mode');
        if (saved !== null)
            return saved === 'true';
        // Primera vez: siempre modo claro
        return false;
    });
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('pancitos-dark-mode', String(isDark));
    }, [isDark]);
    return [isDark, () => setIsDark(prev => !prev)];
};
// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================
const DesktopSidebar = ({ user, currentView, onViewChange, onLogout, isDark, onToggleDark }) => {
    const navItems = [
        { id: 'home', label: 'Inicio', icon: '🏠', activeColor: 'from-peach to-blush', border: 'border-peach' },
        { id: 'recipes', label: 'Recetas', icon: '📖', activeColor: 'from-caramel to-secondary', border: 'border-caramel' },
        ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calculadora', icon: '🧮', activeColor: 'from-honey to-caramel', border: 'border-honey' }] : []),
        ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory', label: 'Inventario', icon: '🛒', activeColor: 'from-wheat to-latte', border: 'border-wheat' }] : []),
        ...(PERMS.canViewCosts(user.role) ? [{ id: 'costs', label: 'Costos', icon: '💰', activeColor: 'from-vanilla to-wheat', border: 'border-vanilla' }] : []),
    ];
    const roleInfo = ROLE_INFO[user.role];
    const initials = user.username.slice(0, 2).toUpperCase();
    return (_jsxs(motion.div, { initial: { x: -300 }, animate: { x: 0 }, className: "fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-primary via-mocha to-primary dark:from-[#150A06] dark:via-[#1A0D08] dark:to-[#0D0705] border-r border-caramel/20 dark:border-amber-900/30 shadow-warm z-50 flex flex-col transition-colors duration-300", children: [_jsx("div", { className: "px-6 pt-7 pb-5 border-b border-caramel/15", children: _jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx(motion.span, { animate: { y: [0, -5, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, className: "text-4xl", children: "\uD83E\uDD50" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold font-playfair text-vanilla leading-none tracking-wide", children: "PANCITOS" }), _jsx("p", { className: "text-[10px] text-peach/60 font-medium tracking-[0.2em] uppercase", children: "Panader\u00EDa Artesanal" })] })] }) }), _jsxs("div", { className: "px-4 py-3 mx-3 mt-4 rounded-2xl glass-warm border border-white/10 flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-caramel to-secondary flex items-center justify-center text-flour text-sm font-bold shadow-warm flex-shrink-0", children: initials }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-vanilla font-semibold text-sm truncate", children: user.username }), _jsxs("span", { className: `text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-vanilla/80`, children: [roleInfo.emoji, " ", roleInfo.label] })] })] }), _jsxs("nav", { className: "flex-1 px-3 py-5 space-y-1.5 overflow-y-auto", children: [_jsx("p", { className: "text-vanilla/30 text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-3", children: "Navegaci\u00F3n" }), navItems.map((item, idx) => {
                        const active = currentView === item.id;
                        return (_jsxs(motion.button, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.07 }, whileHover: { x: active ? 0 : 6 }, whileTap: { scale: 0.97 }, onClick: () => onViewChange(item.id), className: `w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${active
                                ? `bg-gradient-to-r ${item.activeColor} text-primary shadow-warm border-l-4 ${item.border}`
                                : 'text-vanilla/60 hover:text-vanilla hover:bg-white/8 border-l-4 border-transparent'}`, children: [active && (_jsx(motion.div, { layoutId: "sidebar-active", className: "absolute inset-0 bg-white/10 rounded-2xl pointer-events-none", transition: { type: 'spring', stiffness: 400, damping: 30 } })), _jsx("span", { className: "text-xl relative z-10", children: item.icon }), _jsx("span", { className: "font-semibold text-sm relative z-10", children: item.label }), active && _jsx(motion.div, { animate: { scale: [1, 1.4, 1] }, transition: { duration: 2, repeat: Infinity }, className: "ml-auto w-2 h-2 bg-primary/40 rounded-full relative z-10" })] }, item.id));
                    })] }), _jsxs("div", { className: "px-3 pb-5 border-t border-caramel/15 pt-4 space-y-2", children: [_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, onClick: onToggleDark, className: "w-full bg-white/8 hover:bg-white/15 text-vanilla/60 hover:text-vanilla px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all border border-white/10", children: [isDark ? _jsx(Sun, { size: 16 }) : _jsx(Moon, { size: 16 }), isDark ? 'Modo Claro' : 'Modo Oscuro'] }), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, onClick: onLogout, className: "w-full bg-blush/20 hover:bg-blush/30 text-blush px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all border border-blush/20", children: [_jsx(LogOut, { size: 18 }), "Cerrar Sesi\u00F3n"] }), _jsx("p", { className: "text-center text-vanilla/20 text-[10px] font-medium", children: "v2.0.0 \u00B7 PANCITOS \u00A9 2026" })] })] }));
};
// ============================================================================
// MAIN APP
// ============================================================================
const App = () => {
    const state = useAppState();
    const [currentView, setCurrentView] = useState('home');
    const isMobile = useIsMobile();
    const [isDark, toggleDark] = useDarkMode();
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
    return (_jsxs("div", { className: `min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-[#0D0705] via-[#150A06] to-[#1A0D08]' : 'bg-gradient-to-br from-cream via-vanilla to-wheat'}`, children: [!isMobile && (_jsxs(_Fragment, { children: [_jsx(DesktopSidebar, { user: state.user, currentView: currentView, onViewChange: setCurrentView, onLogout: () => {
                            state.setUser(null);
                            localStorage.removeItem('pancitos-remember');
                        }, isDark: isDark, onToggleDark: toggleDark }), _jsxs("header", { className: "fixed top-0 left-72 right-0 h-14 glass-warm bg-gradient-to-r from-vanilla/90 to-wheat/85 dark:from-[#1A0D08]/95 dark:to-[#251410]/90 backdrop-blur-xl border-b border-caramel/20 dark:border-amber-800/20 flex items-center px-8 z-40 transition-colors duration-300", children: [_jsx("div", { className: "flex items-center gap-2 text-primary dark:text-amber-100 font-semibold text-sm", children: ['home', 'recipes', 'calculator', 'inventory', 'costs'].includes(currentView) && (_jsx("span", { className: "capitalize", children: currentView === 'home' ? '🏠 Inicio' : currentView === 'recipes' ? '📖 Recetas' : currentView === 'calculator' ? '🧮 Calculadora' : currentView === 'inventory' ? '🛒 Inventario' : '💰 Costos' })) }), _jsxs("div", { className: "ml-auto text-xs text-mocha/60 dark:text-amber-200/50 font-medium", children: ["PANCITOS \u00B7 ", new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'short' })] })] }), _jsx("main", { className: "ml-72 pt-14 p-8", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, className: "max-w-6xl mx-auto", children: renderView() }, currentView) })] })), isMobile && (_jsxs(_Fragment, { children: [_jsx(motion.button, { className: "fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg", style: {
                            background: isDark ? 'rgba(218,165,32,0.15)' : 'rgba(91,58,41,0.1)',
                            border: isDark ? '1px solid rgba(218,165,32,0.3)' : '1px solid rgba(91,58,41,0.15)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }, onClick: toggleDark, whileTap: { scale: 0.88 }, whileHover: { scale: 1.05 }, children: isDark
                            ? _jsx(Sun, { size: 18, color: "#DAA520" })
                            : _jsx(Moon, { size: 18, color: "#5B3A29" }) }), _jsx("main", { className: "w-full px-4 py-4 pb-24", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, children: renderView() }, currentView) }), _jsx(MobileNavbar, { user: state.user, currentView: currentView, onViewChange: setCurrentView, onLogout: () => {
                            state.setUser(null);
                            localStorage.removeItem('pancitos-remember');
                        } })] }))] }));
};
// ============================================================================
// RENDER
// ============================================================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));
