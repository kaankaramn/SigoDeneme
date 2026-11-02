import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BesUUVme.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DB = "sigorta-kayitlari";
var STORE = "kayitlar";
function open() {
	return new Promise((res, rej) => {
		const r = indexedDB.open(DB, 1);
		r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
		r.onsuccess = () => res(r.result);
		r.onerror = () => rej(r.error);
	});
}
async function tx(mode, fn) {
	const db = await open();
	return new Promise((res, rej) => {
		const req = fn(db.transaction(STORE, mode).objectStore(STORE));
		req.onsuccess = () => res(req.result);
		req.onerror = () => rej(req.error);
	});
}
function normalize(k) {
	const pdfler = k.pdfler ?? (k.pdf ? [{
		id: crypto.randomUUID(),
		ad: k.pdfAd ?? "belge.pdf",
		blob: k.pdf
	}] : []);
	return {
		id: k.id,
		ad: k.ad ?? "",
		tc: k.tc ?? "",
		plaka: k.plaka ?? "",
		olusturma: k.olusturma ?? Date.now(),
		pdfler
	};
}
var tumKayitlar = async () => (await tx("readonly", (s) => s.getAll())).map(normalize);
var kaydet = (k) => tx("readwrite", (s) => s.put(k));
var sil = (id) => tx("readwrite", (s) => s.delete(id));
var toB64 = (b) => new Promise((res) => {
	const r = new FileReader();
	r.onload = () => res(r.result);
	r.readAsDataURL(b);
});
async function yedekAl() {
	const list = await tumKayitlar();
	const out = await Promise.all(list.map(async (k) => ({
		...k,
		pdfler: await Promise.all(k.pdfler.map(async (p) => ({
			id: p.id,
			ad: p.ad,
			blob: await toB64(p.blob)
		})))
	})));
	return new Blob([JSON.stringify(out)], { type: "application/json" });
}
async function yedekYukle(file) {
	const data = JSON.parse(await file.text());
	for (const k of data) {
		const toBlob = async (s) => (await fetch(s)).blob();
		const pdfler = k.pdfler ? await Promise.all(k.pdfler.map(async (p) => ({
			...p,
			blob: await toBlob(p.blob)
		}))) : k.pdf ? [{
			id: crypto.randomUUID(),
			ad: k.pdfAd ?? "belge.pdf",
			blob: await toBlob(k.pdf)
		}] : [];
		await kaydet(normalize({
			id: k.id,
			ad: k.ad ?? "",
			tc: k.tc ?? "",
			plaka: k.plaka ?? "",
			olusturma: k.olusturma ?? Date.now(),
			pdfler
		}));
	}
	return data.length;
}
var AUTH_KEY = "durakoglu-giris-v2";
async function hash(s) {
	const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
	return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function hesapOku() {
	const ham = localStorage.getItem(AUTH_KEY);
	if (ham) return JSON.parse(ham);
	const v = {
		k: "admin",
		h: await hash("12345")
	};
	localStorage.setItem(AUTH_KEY, JSON.stringify(v));
	return v;
}
var mevcutKullanici = async () => (await hesapOku()).k;
async function girisKontrol(kullanici, sifre) {
	const v = await hesapOku();
	return v.k === kullanici.trim() && v.h === await hash(sifre);
}
async function hesapGuncelle(eskiSifre, yeniKullanici, yeniSifre) {
	const v = await hesapOku();
	if (v.h !== await hash(eskiSifre)) return false;
	localStorage.setItem(AUTH_KEY, JSON.stringify({
		k: yeniKullanici.trim() || v.k,
		h: yeniSifre ? await hash(yeniSifre) : v.h
	}));
	return true;
}
function Index() {
	const [girdi, setGirdi] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setGirdi(sessionStorage.getItem("oturum") === "1"), []);
	if (girdi === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-hero" });
	if (!girdi) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Giris, { onOk: () => {
		sessionStorage.setItem("oturum", "1");
		setGirdi(true);
	} });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Uygulama, { cikis: () => {
		sessionStorage.removeItem("oturum");
		setGirdi(false);
	} });
}
function Giris({ onOk }) {
	const [k, setK] = (0, import_react.useState)("");
	const [s, setS] = (0, import_react.useState)("");
	const [hata, setHata] = (0, import_react.useState)("");
	async function gonder(e) {
		e.preventDefault();
		if (!k.trim() || !s) return setHata("Kullanıcı adı ve şifre gerekli.");
		if (await girisKontrol(k, s)) onOk();
		else setHata("Kullanıcı adı veya şifre hatalı.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-hero px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: gonder,
			className: "panel w-full max-w-md space-y-5 p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand font-display text-2xl text-primary-foreground",
							children: "D"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl",
							children: "Durakoğlu Sigorta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Devam etmek için giriş yapın"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
					label: "Kullanıcı Adı",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						autoFocus: true,
						value: k,
						onChange: (e) => setK(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
					label: "Şifre",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "password",
						value: s,
						onChange: (e) => setS(e.target.value)
					})
				}),
				hata && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: hata
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold w-full",
					type: "submit",
					children: "Giriş Yap"
				})
			]
		})
	});
}
var bos = {
	ad: "",
	tc: "",
	plaka: ""
};
var trUp = (s) => s.toLocaleUpperCase("tr-TR");
function Uygulama({ cikis }) {
	const [list, setList] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)(bos);
	const [belgeler, setBelgeler] = (0, import_react.useState)([]);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [f, setF] = (0, import_react.useState)({
		ad: "",
		tc: "",
		plaka: "",
		pdf: "hepsi"
	});
	const [hata, setHata] = (0, import_react.useState)("");
	const [bilgi, setBilgi] = (0, import_react.useState)("");
	const [detayId, setDetayId] = (0, import_react.useState)(null);
	const [hesapAcik, setHesapAcik] = (0, import_react.useState)(false);
	const detay = detayId ? list.find((k) => k.id === detayId) : void 0;
	const pdfRef = (0, import_react.useRef)(null);
	const yedekRef = (0, import_react.useRef)(null);
	const yenile = () => tumKayitlar().then((l) => setList(l.sort((a, b) => b.olusturma - a.olusturma)));
	(0, import_react.useEffect)(() => {
		yenile();
	}, []);
	const filtreli = (0, import_react.useMemo)(() => list.filter((k) => trUp(k.ad).includes(trUp(f.ad)) && k.tc.includes(f.tc) && trUp(k.plaka).replace(/\s/g, "").includes(trUp(f.plaka).replace(/\s/g, "")) && (f.pdf === "hepsi" || (f.pdf === "var" ? k.pdfler.length > 0 : k.pdfler.length === 0))), [list, f]);
	const flash = (m) => {
		setBilgi(m);
		setTimeout(() => setBilgi(""), 2500);
	};
	async function gonder(e) {
		e.preventDefault();
		if (!form.ad.trim()) return setHata("İsim gerekli.");
		if (!/^\d{11}$/.test(form.tc)) return setHata("TC Kimlik No 11 haneli olmalı.");
		if (!form.plaka.trim()) return setHata("Plaka gerekli.");
		setHata("");
		const eski = editId ? list.find((k) => k.id === editId) : void 0;
		await kaydet({
			id: editId ?? crypto.randomUUID(),
			ad: form.ad.trim(),
			tc: form.tc,
			plaka: trUp(form.plaka.trim()),
			pdfler: belgeler,
			olusturma: eski?.olusturma ?? Date.now()
		});
		flash(editId ? "Kayıt güncellendi" : "Kayıt eklendi");
		temizle();
		yenile();
	}
	function temizle() {
		setForm(bos);
		setBelgeler([]);
		setEditId(null);
		setHata("");
		if (pdfRef.current) pdfRef.current.value = "";
	}
	function duzenle(k) {
		setEditId(k.id);
		setForm({
			ad: k.ad,
			tc: k.tc,
			plaka: k.plaka
		});
		setBelgeler(k.pdfler);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}
	const pdfAc = (b) => window.open(URL.createObjectURL(b.blob), "_blank");
	async function yedekIndir() {
		const b = await yedekAl();
		const a = document.createElement("a");
		a.href = URL.createObjectURL(b);
		a.download = `durakoglu-yedek-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		a.click();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-hero",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-card/70 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-11 w-11 items-center justify-center rounded-xl bg-brand font-display text-xl text-primary-foreground",
							children: "D"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl text-foreground",
							children: "Durakoğlu Sigorta"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost",
								onClick: yedekIndir,
								children: "Yedek Al"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost",
								onClick: () => yedekRef.current?.click(),
								children: "Yedek Yükle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost",
								onClick: () => setHesapAcik(true),
								children: "Hesap"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-ghost",
								onClick: cikis,
								children: "Çıkış"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: yedekRef,
								type: "file",
								accept: ".json",
								hidden: true,
								onChange: async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									const n = await yedekYukle(file);
									flash(`${n} kayıt yüklendi`);
									yenile();
									e.target.value = "";
								}
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1600px] space-y-8 px-6 py-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: gonder,
					className: "panel p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-5 flex items-center justify-between",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: editId ? "Kaydı Düzenle" : "Yeni Kayıt"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 md:grid-cols-2 xl:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
									label: "Ad Soyad",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										value: form.ad,
										onChange: (e) => setForm({
											...form,
											ad: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
									label: "TC Kimlik No",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field font-mono",
										inputMode: "numeric",
										maxLength: 11,
										value: form.tc,
										onChange: (e) => setForm({
											...form,
											tc: e.target.value.replace(/\D/g, "")
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
									label: "Plaka",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field font-mono uppercase",
										placeholder: "34 ABC 123",
										value: form.plaka,
										onChange: (e) => setForm({
											...form,
											plaka: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs font-semibold tracking-widest text-muted-foreground uppercase",
										children: "PDF Belgeler"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "dropzone",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: pdfRef,
											type: "file",
											accept: "application/pdf",
											multiple: true,
											hidden: true,
											onChange: (e) => {
												const yeni = Array.from(e.target.files ?? []).map((file) => ({
													id: crypto.randomUUID(),
													ad: file.name,
													blob: file
												}));
												setBelgeler((b) => [...b, ...yeni]);
												e.target.value = "";
											}
										}), "+ PDF ekle (birden fazla seçebilirsiniz)"]
									})]
								})
							]
						}),
						belgeler.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: belgeler.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => pdfAc(b),
									className: "hover:underline",
									children: b.ad
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Kaldır",
									className: "text-destructive",
									onClick: () => setBelgeler((x) => x.filter((y) => y.id !== b.id)),
									children: "✕"
								})]
							}, b.id))
						}),
						hata && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-destructive",
							children: hata
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-gold px-10",
								type: "submit",
								children: editId ? "Güncelle" : "Kaydet"
							}), editId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-ghost",
								onClick: temizle,
								children: "İptal"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									placeholder: "İsme göre filtrele",
									value: f.ad,
									onChange: (e) => setF({
										...f,
										ad: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field font-mono",
									placeholder: "TC'ye göre",
									value: f.tc,
									onChange: (e) => setF({
										...f,
										tc: e.target.value.replace(/\D/g, "")
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field font-mono",
									placeholder: "Plakaya göre",
									value: f.plaka,
									onChange: (e) => setF({
										...f,
										plaka: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field",
									value: f.pdf,
									onChange: (e) => setF({
										...f,
										pdf: e.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "hepsi",
											children: "PDF: Hepsi"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "var",
											children: "PDF var"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "yok",
											children: "PDF yok"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								filtreli.length,
								" / ",
								list.length,
								" kayıt gösteriliyor"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-left text-xs font-bold tracking-widest text-secondary-foreground uppercase",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-6 py-5",
												children: "Ad Soyad"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-6 py-5",
												children: "TC"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-6 py-5",
												children: "Plaka"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-6 py-5",
												children: "Belgeler"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-6 py-5 text-right",
												children: "İşlem"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtreli.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border transition-colors hover:bg-accent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-5 font-semibold",
											children: k.ad
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-5 font-mono",
											children: k.tc
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "plate",
												children: k.plaka
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-5",
											children: k.pdfler.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-2",
												children: k.pdfler.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "chip hover:underline",
													onClick: () => pdfAc(b),
													children: b.ad
												}, b.id))
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "—"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "space-x-4 px-6 py-5 text-right whitespace-nowrap",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "font-semibold text-emerald-600 hover:underline",
													onClick: () => setDetayId(k.id),
													children: "Görüntüle"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "font-semibold text-primary hover:underline",
													onClick: () => duzenle(k),
													children: "Düzenle"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "font-semibold text-destructive hover:underline",
													onClick: async () => {
														if (confirm(`${k.ad} kaydı silinsin mi?`)) {
															await sil(k.id);
															if (detayId === k.id) setDetayId(null);
															yenile();
														}
													},
													children: "Sil"
												})
											]
										})
									]
								}, k.id)), filtreli.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "p-16 text-center text-muted-foreground",
									children: list.length ? "Filtreye uyan kayıt yok." : "Henüz kayıt yok. Yukarıdan ilk kaydı ekleyin."
								}) })] })]
							})
						})
					]
				})]
			}),
			detay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detay, {
				kayit: detay,
				onClose: () => setDetayId(null),
				onEdit: () => {
					duzenle(detay);
					setDetayId(null);
				},
				yenile,
				flash
			}),
			hesapAcik && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hesap, {
				onClose: () => setHesapAcik(false),
				flash
			}),
			bilgi && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast",
				children: bilgi
			})
		]
	});
}
function Detay({ kayit, onClose, onEdit, yenile, flash }) {
	const [secili, setSecili] = (0, import_react.useState)(kayit.pdfler[0]?.id ?? null);
	const [url, setUrl] = (0, import_react.useState)(null);
	const ekleRef = (0, import_react.useRef)(null);
	const belge = kayit.pdfler.find((b) => b.id === secili) ?? kayit.pdfler[0];
	(0, import_react.useEffect)(() => {
		const h = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, [onClose]);
	(0, import_react.useEffect)(() => {
		if (!belge) return setUrl(null);
		const u = URL.createObjectURL(belge.blob);
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [belge]);
	async function ekle(files) {
		const yeni = Array.from(files ?? []).map((file) => ({
			id: crypto.randomUUID(),
			ad: file.name,
			blob: file
		}));
		if (!yeni.length) return;
		await kaydet({
			...kayit,
			pdfler: [...kayit.pdfler, ...yeni]
		});
		setSecili(yeni[0].id);
		flash(`${yeni.length} belge eklendi`);
		yenile();
	}
	async function belgeSil(b) {
		if (!confirm(`"${b.ad}" silinsin mi?`)) return;
		const kalan = kayit.pdfler.filter((x) => x.id !== b.id);
		await kaydet({
			...kayit,
			pdfler: kalan
		});
		if (secili === b.id) setSecili(kalan[0]?.id ?? null);
		yenile();
	}
	function indir(b) {
		const a = document.createElement("a");
		a.href = URL.createObjectURL(b.blob);
		a.download = b.ad;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "modal-back",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "modal p-7",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: kayit.ad
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono",
							children: ["TC: ", kayit.tc]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "plate",
							children: kayit.plaka
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["Kayıt: ", new Date(kayit.olusturma).toLocaleDateString("tr-TR")]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-ghost",
						onClick: onEdit,
						children: "Düzenle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-ghost",
						onClick: onClose,
						children: "Kapat ✕"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[320px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-xs font-semibold tracking-widest text-muted-foreground uppercase",
									children: [
										"Belgeler (",
										kayit.pdfler.length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "text-sm font-semibold text-primary hover:underline",
									onClick: () => ekleRef.current?.click(),
									children: "+ PDF ekle"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: ekleRef,
									type: "file",
									accept: "application/pdf",
									multiple: true,
									hidden: true,
									onChange: (e) => {
										ekle(e.target.files);
										e.target.value = "";
									}
								})
							]
						}),
						kayit.pdfler.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Bu kişiye henüz belge eklenmemiş."
						}),
						kayit.pdfler.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "belge-row",
							"data-aktif": b.id === belge?.id,
							onClick: () => setSecili(b.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm font-semibold",
								title: b.ad,
								children: b.ad
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 gap-3 text-xs font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "text-primary hover:underline",
										onClick: (e) => {
											e.stopPropagation();
											window.open(URL.createObjectURL(b.blob), "_blank");
										},
										children: "Aç"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "text-primary hover:underline",
										onClick: (e) => {
											e.stopPropagation();
											indir(b);
										},
										children: "İndir"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "text-destructive hover:underline",
										onClick: (e) => {
											e.stopPropagation();
											belgeSil(b);
										},
										children: "Sil"
									})
								]
							})]
						}, b.id))
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-[60vh] overflow-hidden rounded-xl border border-border bg-muted",
					children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						src: url,
						title: belge?.ad,
						className: "h-[70vh] w-full"
					}, url) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full min-h-[60vh] items-center justify-center text-muted-foreground",
						children: "Önizlemek için bir belge seçin"
					})
				})]
			})]
		})
	});
}
function Hesap({ onClose, flash }) {
	const [kAd, setKAd] = (0, import_react.useState)("");
	const [eski, setEski] = (0, import_react.useState)("");
	const [yeni, setYeni] = (0, import_react.useState)("");
	const [hata, setHata] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		mevcutKullanici().then(setKAd);
	}, []);
	async function gonder(e) {
		e.preventDefault();
		if (!kAd.trim()) return setHata("Kullanıcı adı boş olamaz.");
		if (yeni && yeni.length < 4) return setHata("Yeni şifre en az 4 karakter olmalı.");
		if (await hesapGuncelle(eski, kAd, yeni)) {
			flash("Hesap güncellendi");
			onClose();
		} else setHata("Mevcut şifre hatalı.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "modal-back",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: gonder,
			className: "modal max-w-md space-y-5 p-8",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Hesap Ayarları"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
					label: "Kullanıcı Adı",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: kAd,
						onChange: (e) => setKAd(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
					label: "Mevcut Şifre",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "password",
						value: eski,
						onChange: (e) => setEski(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alan, {
					label: "Yeni Şifre (değişmeyecekse boş bırakın)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "password",
						value: yeni,
						onChange: (e) => setYeni(e.target.value)
					})
				}),
				hata && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: hata
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold",
						type: "submit",
						children: "Kaydet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-ghost",
						type: "button",
						onClick: onClose,
						children: "İptal"
					})]
				})
			]
		})
	});
}
function Alan({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold tracking-widest text-muted-foreground uppercase",
			children: label
		}), children]
	});
}
//#endregion
export { Index as component };
