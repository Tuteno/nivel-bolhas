import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';

export default function App() {

  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let assinatura;
    let ativo = true;

    async function iniciarSensor() {
      try {
        const disponivel = await Accelerometer.isAvailableAsync();
        if (!ativo) return;
        if (!disponivel) {
          setErro('Sensor indisponível. Abra em um celular físico.');
          return;
        }

        Accelerometer.setUpdateInterval(100);
        assinatura = Accelerometer.addListener((leitura) => {
          if (ativo) setDados(leitura);
        });
      } catch {
        if (ativo) setErro('Não foi possível acessar o sensor. Reabra o app.');
      }
    }

    iniciarSensor();

    return () => {
      ativo = false;
      assinatura && assinatura.remove();
    };
  }, []);

  const x = dados?.x ?? 0;
  const y = dados?.y ?? 0;
  const nivelado = dados !== null && Math.abs(x) < 0.04 && Math.abs(y) < 0.04;
  const cor = nivelado ? '#22c55e' : '#facc15';


  const deslocamentox =  x * 100;
  const deslocamentoy = y * 100;
  const distancia = Math.hypot(deslocamentox, deslocamentoy);
  const limite = Math.max(1, distancia / 90);


  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <StatusBar style="light" />
      <Text style={styles.titulo}>Nível de Bolha</Text>
      <Text style={styles.instrucao}>
        Apoie o celular com a tela para cima.{ '\n' }
        Incline devagar e observe a bolha.
      </Text>

      <View style={styles.nivel}>
        <View style={styles.linhaHorizontal} />
        <View style={styles.linhaVertical} />
        <View style={styles.alvo} />
        {dados && !erro && (
          <View style={[styles.bolha, {
            backgroundColor: cor,
            transform: [
              { translateX: deslocamentox / limite },
              { translateY: deslocamentoy / limite },
            ],
          }]} />
        )}
      </View>

      <Text style={[styles.status, { color: erro ? '#fca5a5' : cor }]}>
        {erro || (!dados ? 'Aguardando sensor...' : nivelado ? 'Nível!' : 'Inclinado!')}
      </Text>
      <Text style={styles.leitura}>
        X: {dados ? x.toFixed(2) : '--'} g | Y: {dados ? y.toFixed(2) : '--'} g
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
  },
  instrucao: {
    fontSize: 16,
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 20,
  },
  nivel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  linhaHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#f8fafc',
  },
  linhaVertical: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  alvo: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  bolha: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leitura: {
    fontSize: 16,
    color: '#f8fafc',
  },
});