import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  girisKontrol,
  hesapGuncelle,
  mevcutKullanici,
  kaydet,
  sil,
  tumKayitlar,
  yedekAl,
  yedekYukle,
  type Belge,
  type Kayit,
} from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Durakoğlu Sigorta — Müşteri Kayıtları" },
      { name: "description", content: "Durakoğlu Sigorta için çevrimdışı müşteri kayıt ve PDF arşivi." },
      { property: "og:title", content: "Durakoğlu Sigorta — Müşteri Kayıtları" },
      { property: "og:description", content: "İsim, TC, plaka ve çoklu PDF belgeleriyle yerel müşteri veritabanı." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [girdi, setGirdi] = useState<boolean | null>(null);
  useEffect(() => setGirdi(sessionStorage.getItem("oturum") === "1"), []);
  if (girdi === null) return <div className="min-h-screen bg-hero" />;
  if (!girdi)
    return (
      <Giris
        onOk={() => {
          sessionStorage.setItem("oturum", "1");
          setGirdi(true);
        }}
      />
    );
  return (
    <Uygulama
      cikis={() => {
        sessionStorage.removeItem("oturum");
        setGirdi(false);
      }}
    />
  );
}

function Giris({ onOk }: { onOk: () => void }) {
  const [k, setK] = useState("");
  const [s, setS] = useState("");
  const [hata, setHata] = useState("");

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!k.trim() || !s) return setHata("Kullanıcı adı ve şifre gerekli.");
    if (await girisKontrol(k, s)) onOk();
    else setHata("Kullanıcı adı veya şifre hatalı.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form onSubmit={gonder} className="panel w-full max-w-md space-y-5 p-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand font-display text-2xl text-primary-foreground">D</div>
          <h1 className="font-display text-3xl">Durakoğlu Sigorta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Devam etmek için giriş yapın</p>
        </div>
        <Alan label="Kullanıcı Adı">
          <input className="field" autoFocus value={k} onChange={(e) => setK(e.target.value)} />
        </Alan>
        <Alan label="Şifre">
          <input className="field" type="password" value={s} onChange={(e) => setS(e.target.value)} />
        </Alan>
        {hata && <p className="text-sm text-destructive">{hata}</p>}
        <button className="btn-gold w-full" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

const bos = { ad: "", tc: "", plaka: "" };
const trUp = (s: string) => s.toLocaleUpperCase("tr-TR");

function Uygulama({ cikis }: { cikis: () => void }) {
  const [list, setList] = useState<Kayit[]>([]);
  const [form, setForm] = useState(bos);
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ ad: "", tc: "", plaka: "", pdf: "hepsi" });
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [detayId, setDetayId] = useState<string | null>(null);
  const [hesapAcik, setHesapAcik] = useState(false);
  const detay = detayId ? list.find((k) => k.id === detayId) : undefined;
  const pdfRef = useRef<HTMLInputElement>(null);
  const yedekRef = useRef<HTMLInputElement>(null);

  const yenile = () => tumKayitlar().then((l) => setList(l.sort((a, b) => b.olusturma - a.olusturma)));
  useEffect(() => {
    yenile();
  }, []);

  const filtreli = useMemo(
    () =>
      list.filter(
        (k) =>
          trUp(k.ad).includes(trUp(f.ad)) &&
          k.tc.includes(f.tc) &&
          trUp(k.plaka).replace(/\s/g, "").includes(trUp(f.plaka).replace(/\s/g, "")) &&
          (f.pdf === "hepsi" || (f.pdf === "var" ? k.pdfler.length > 0 : k.pdfler.length === 0)),
      ),
    [list, f],
  );

  const flash = (m: string) => {
    setBilgi(m);
    setTimeout(() => setBilgi(""), 2500);
  };

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ad.trim()) return setHata("İsim gerekli.");
    if (!/^\d{11}$/.test(form.tc)) return setHata("TC Kimlik No 11 haneli olmalı.");
    if (!form.plaka.trim()) return setHata("Plaka gerekli.");
    setHata("");
    const eski = editId ? list.find((k) => k.id === editId) : undefined;
    await kaydet({
      id: editId ?? crypto.randomUUID(),
      ad: form.ad.trim(),
      tc: form.tc,
      plaka: trUp(form.plaka.trim()),
      pdfler: belgeler,
      olusturma: eski?.olusturma ?? Date.now(),
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

  function duzenle(k: Kayit) {
    setEditId(k.id);
    setForm({ ad: k.ad, tc: k.tc, plaka: k.plaka });
    setBelgeler(k.pdfler);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pdfAc = (b: Belge) => window.open(URL.createObjectURL(b.blob), "_blank");

  async function yedekIndir() {
    const b = await yedekAl();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `durakoglu-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand font-display text-xl text-primary-foreground">D</div>
            <h1 className="font-display text-3xl text-foreground">Durakoğlu Sigorta</h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={yedekIndir}>Yedek Al</button>
            <button className="btn-ghost" onClick={() => yedekRef.current?.click()}>Yedek Yükle</button>
            <button className="btn-ghost" onClick={() => setHesapAcik(true)}>Hesap</button>
            <button className="btn-ghost" onClick={cikis}>Çıkış</button>
            <input
              ref={yedekRef}
              type="file"
              accept=".json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const n = await yedekYukle(file);
                flash(`${n} kayıt yüklendi`);
                yenile();
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-8 px-6 py-8">
        <form onSubmit={gonder} className="panel p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl">{editId ? "Kaydı Düzenle" : "Yeni Kayıt"}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Alan label="Ad Soyad">
              <input className="field" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
            </Alan>
            <Alan label="TC Kimlik No">
              <input
                className="field font-mono"
                inputMode="numeric"
                maxLength={11}
                value={form.tc}
                onChange={(e) => setForm({ ...form, tc: e.target.value.replace(/\D/g, "") })}
              />
            </Alan>
            <Alan label="Plaka">
              <input
                className="field font-mono uppercase"
                placeholder="34 ABC 123"
                value={form.plaka}
                onChange={(e) => setForm({ ...form, plaka: e.target.value })}
              />
            </Alan>
            <div className="space-y-2">
              <span className="block text-xs font-semibold tracking-widest text-muted-foreground uppercase">PDF Belgeler</span>
              <label className="dropzone">
                <input
                  ref={pdfRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => {
                    const yeni = Array.from(e.target.files ?? []).map((file) => ({ id: crypto.randomUUID(), ad: file.name, blob: file as Blob }));
                    setBelgeler((b) => [...b, ...yeni]);
                    e.target.value = "";
                  }}
                />
                + PDF ekle (birden fazla seçebilirsiniz)
              </label>
            </div>
          </div>
          {belgeler.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {belgeler.map((b) => (
                <span key={b.id} className="chip">
                  <button type="button" onClick={() => pdfAc(b)} className="hover:underline">{b.ad}</button>
                  <button type="button" aria-label="Kaldır" className="text-destructive" onClick={() => setBelgeler((x) => x.filter((y) => y.id !== b.id))}>✕</button>
                </span>
              ))}
            </div>
          )}
          {hata && <p className="mt-4 text-sm text-destructive">{hata}</p>}
          <div className="mt-5 flex gap-2">
            <button className="btn-gold px-10" type="submit">{editId ? "Güncelle" : "Kaydet"}</button>
            {editId && <button type="button" className="btn-ghost" onClick={temizle}>İptal</button>}
          </div>
        </form>

        <section className="space-y-4">
          <div className="panel grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <input className="field" placeholder="İsme göre filtrele" value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} />
            <input className="field font-mono" placeholder="TC'ye göre" value={f.tc} onChange={(e) => setF({ ...f, tc: e.target.value.replace(/\D/g, "") })} />
            <input className="field font-mono" placeholder="Plakaya göre" value={f.plaka} onChange={(e) => setF({ ...f, plaka: e.target.value })} />
            <select className="field" value={f.pdf} onChange={(e) => setF({ ...f, pdf: e.target.value })}>
              <option value="hepsi">PDF: Hepsi</option>
              <option value="var">PDF var</option>
              <option value="yok">PDF yok</option>
            </select>
          </div>

          <p className="text-sm text-muted-foreground">
            {filtreli.length} / {list.length} kayıt gösteriliyor
          </p>

          <div className="panel overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-secondary">
                <tr className="text-left text-xs font-bold tracking-widest text-secondary-foreground uppercase">
                  <th className="px-6 py-5">Ad Soyad</th>
                  <th className="px-6 py-5">TC</th>
                  <th className="px-6 py-5">Plaka</th>
                  <th className="px-6 py-5">Belgeler</th>
                  <th className="px-6 py-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtreli.map((k) => (
                  <tr key={k.id} className="border-t border-border transition-colors hover:bg-accent">
                    <td className="px-6 py-5 font-semibold">{k.ad}</td>
                    <td className="px-6 py-5 font-mono">{k.tc}</td>
                    <td className="px-6 py-5"><span className="plate">{k.plaka}</span></td>
                    <td className="px-6 py-5">
                      {k.pdfler.length ? (
                        <div className="flex flex-wrap gap-2">
                          {k.pdfler.map((b) => (
                            <button key={b.id} className="chip hover:underline" onClick={() => pdfAc(b)}>{b.ad}</button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="space-x-4 px-6 py-5 text-right whitespace-nowrap">
                      <button className="font-semibold text-emerald-600 hover:underline" onClick={() => setDetayId(k.id)}>Görüntüle</button>
                      <button className="font-semibold text-primary hover:underline" onClick={() => duzenle(k)}>Düzenle</button>
                      <button
                        className="font-semibold text-destructive hover:underline"
                        onClick={async () => {
                          if (confirm(`${k.ad} kaydı silinsin mi?`)) {
                            await sil(k.id);
                            if (detayId === k.id) setDetayId(null);
                            yenile();
                          }
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {filtreli.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-muted-foreground">
                      {list.length ? "Filtreye uyan kayıt yok." : "Henüz kayıt yok. Yukarıdan ilk kaydı ekleyin."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {detay && <Detay kayit={detay} onClose={() => setDetayId(null)} onEdit={() => { duzenle(detay); setDetayId(null); }} yenile={yenile} flash={flash} />}
      {hesapAcik && <Hesap onClose={() => setHesapAcik(false)} flash={flash} />}
      {bilgi && <div className="toast">{bilgi}</div>}
    </div>
  );
}

function Detay({ kayit, onClose, onEdit, yenile, flash }: { kayit: Kayit; onClose: () => void; onEdit: () => void; yenile: () => void; flash: (m: string) => void }) {
  const [secili, setSecili] = useState<string | null>(kayit.pdfler[0]?.id ?? null);
  const [url, setUrl] = useState<string | null>(null);
  const ekleRef = useRef<HTMLInputElement>(null);
  const belge = kayit.pdfler.find((b) => b.id === secili) ?? kayit.pdfler[0];

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (!belge) return setUrl(null);
    const u = URL.createObjectURL(belge.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [belge]);

  async function ekle(files: FileList | null) {
    const yeni = Array.from(files ?? []).map((file) => ({ id: crypto.randomUUID(), ad: file.name, blob: file as Blob }));
    if (!yeni.length) return;
    await kaydet({ ...kayit, pdfler: [...kayit.pdfler, ...yeni] });
    setSecili(yeni[0]!.id);
    flash(`${yeni.length} belge eklendi`);
    yenile();
  }

  async function belgeSil(b: Belge) {
    if (!confirm(`"${b.ad}" silinsin mi?`)) return;
    const kalan = kayit.pdfler.filter((x) => x.id !== b.id);
    await kaydet({ ...kayit, pdfler: kalan });
    if (secili === b.id) setSecili(kalan[0]?.id ?? null);
    yenile();
  }

  function indir(b: Belge) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b.blob);
    a.download = b.ad;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal p-7" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">{kayit.ad}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-mono">TC: {kayit.tc}</span>
              <span className="plate">{kayit.plaka}</span>
              <span className="text-muted-foreground">Kayıt: {new Date(kayit.olusturma).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onEdit}>Düzenle</button>
            <button className="btn-ghost" onClick={onClose}>Kapat ✕</button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Belgeler ({kayit.pdfler.length})</h3>
              <button className="text-sm font-semibold text-primary hover:underline" onClick={() => ekleRef.current?.click()}>+ PDF ekle</button>
              <input ref={ekleRef} type="file" accept="application/pdf" multiple hidden onChange={(e) => { ekle(e.target.files); e.target.value = ""; }} />
            </div>
            {kayit.pdfler.length === 0 && <p className="text-sm text-muted-foreground">Bu kişiye henüz belge eklenmemiş.</p>}
            {kayit.pdfler.map((b) => (
              <div key={b.id} className="belge-row" data-aktif={b.id === belge?.id} onClick={() => setSecili(b.id)}>
                <span className="truncate text-sm font-semibold" title={b.ad}>{b.ad}</span>
                <span className="flex shrink-0 gap-3 text-xs font-semibold">
                  <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); window.open(URL.createObjectURL(b.blob), "_blank"); }}>Aç</button>
                  <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); indir(b); }}>İndir</button>
                  <button className="text-destructive hover:underline" onClick={(e) => { e.stopPropagation(); belgeSil(b); }}>Sil</button>
                </span>
              </div>
            ))}
          </div>

          <div className="min-h-[60vh] overflow-hidden rounded-xl border border-border bg-muted">
            {url ? (
              <iframe key={url} src={url} title={belge?.ad} className="h-[70vh] w-full" />
            ) : (
              <div className="flex h-full min-h-[60vh] items-center justify-center text-muted-foreground">Önizlemek için bir belge seçin</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hesap({ onClose, flash }: { onClose: () => void; flash: (m: string) => void }) {
  const [kAd, setKAd] = useState("");
  const [eski, setEski] = useState("");
  const [yeni, setYeni] = useState("");
  const [hata, setHata] = useState("");
  useEffect(() => { mevcutKullanici().then(setKAd); }, []);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!kAd.trim()) return setHata("Kullanıcı adı boş olamaz.");
    if (yeni && yeni.length < 4) return setHata("Yeni şifre en az 4 karakter olmalı.");
    if (await hesapGuncelle(eski, kAd, yeni)) {
      flash("Hesap güncellendi");
      onClose();
    } else setHata("Mevcut şifre hatalı.");
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <form onSubmit={gonder} className="modal max-w-md space-y-5 p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl">Hesap Ayarları</h2>
        <Alan label="Kullanıcı Adı"><input className="field" value={kAd} onChange={(e) => setKAd(e.target.value)} /></Alan>
        <Alan label="Mevcut Şifre"><input className="field" type="password" value={eski} onChange={(e) => setEski(e.target.value)} /></Alan>
        <Alan label="Yeni Şifre (değişmeyecekse boş bırakın)"><input className="field" type="password" value={yeni} onChange={(e) => setYeni(e.target.value)} /></Alan>
        {hata && <p className="text-sm text-destructive">{hata}</p>}
        <div className="flex gap-2">
          <button className="btn-gold" type="submit">Kaydet</button>
          <button className="btn-ghost" type="button" onClick={onClose}>İptal</button>
        </div>
      </form>
    </div>
  );
}

function Alan({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
      {children}
    </label>
  );
}